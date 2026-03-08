import {
  GoogleGenAI,
  HarmBlockThreshold,
  HarmCategory,
  type SafetySetting,
} from "@google/genai";

import type { AgentDecision } from "./agent";

const DEFAULT_MODEL = "gemini-2.5-flash";
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5000;
const REQUEST_TIMEOUT_MS = 30000;

export interface StrategyReasoning {
  summary: string;
  thesis: string;
  risks: string[];
  actionBias: "hold" | "rebalance";
  confidence: number;
}

function getGeminiApiKeys() {
  const keys: string[] = [];

  if (process.env.GEMINI_API_KEY) {
    keys.push(process.env.GEMINI_API_KEY);
  }

  for (let index = 1; index <= 10; index += 1) {
    const key = process.env[`GEMINI_API_KEY_${index}`];
    if (key) {
      keys.push(key);
    }
  }

  return keys;
}

class GeminiReasoningService {
  private apiKeys: string[] = [];
  private currentKeyIndex = -1;
  private client: GoogleGenAI | null = null;

  private initialize() {
    if (this.apiKeys.length > 0) {
      return;
    }

    this.apiKeys = getGeminiApiKeys();
    if (!this.apiKeys.length) {
      return;
    }

    this.rotateClient();
  }

  private rotateClient() {
    if (!this.apiKeys.length) {
      this.client = null;
      return;
    }

    this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeys.length;
    this.client = new GoogleGenAI({
      apiKey: this.apiKeys[this.currentKeyIndex],
    });
  }

  private withTimeout<T>(promise: Promise<T>, timeoutMs: number) {
    return Promise.race<T>([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error("Request timeout")), timeoutMs),
      ),
    ]);
  }

  private async withRetry<T>(operation: () => Promise<T>, attempt = 0): Promise<T> {
    try {
      return await this.withTimeout(operation(), REQUEST_TIMEOUT_MS);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : String(error || "Unknown error");
      const retryableErrors = [
        "429",
        "503",
        "timeout",
        "network",
        "econnreset",
        "etimedout",
        "rate limit",
        "overloaded",
        "empty_thought_response",
      ];

      const isRetryable =
        attempt < MAX_RETRIES &&
        retryableErrors.some((code) =>
          message.toLowerCase().includes(code.toLowerCase()),
        );

      if (!isRetryable) {
        throw error;
      }

      this.rotateClient();
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      return this.withRetry(operation, attempt + 1);
    }
  }

  private getSafetySettings() {
    const threshold =
      resolveSafetyThreshold(process.env.GEMINI_SAFETY_THRESHOLD) ||
      HarmBlockThreshold.BLOCK_ONLY_HIGH;
    return [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold },
    ] satisfies SafetySetting[];
  }

  private getText(result: unknown) {
    try {
      const response = (result as { response?: unknown }).response ?? result;
      const candidate = (
        response as {
          candidates?: Array<{
            content?: {
              parts?: Array<{ thought?: boolean; text?: string }>;
            };
          }>;
          text?: string | (() => string);
        }
      ).candidates?.[0];

      const rawText =
        candidate?.content?.parts
          ?.filter((part) => !part.thought && part.text)
          .map((part) => part.text)
          .join("")
          .trim() || "";

      if (rawText) {
        return rawText;
      }

      if (typeof (response as { text?: unknown }).text === "function") {
        return ((response as { text: () => string }).text() || "").trim() || null;
      }

      if (typeof (response as { text?: unknown }).text === "string") {
        return ((response as { text: string }).text || "").trim() || null;
      }

      return null;
    } catch {
      return null;
    }
  }

  private getThoughtTokenCount(result: unknown) {
    const response = (result as { response?: unknown }).response ?? result;
    const usage = (
      response as {
        usageMetadata?: {
          thoughtsTokenCount?: number;
          getThoughtsTokenCount?: () => number;
        };
      }
    ).usageMetadata;

    return (
      usage?.getThoughtsTokenCount?.() ??
      usage?.thoughtsTokenCount ??
      0
    );
  }

  async generateStrategyReasoning(decision: AgentDecision) {
    this.initialize();

    if (!this.client) {
      return null;
    }

    const operation = async () => {
      const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
      const result = await this.client!.models.generateContent({
        model,
        contents: [
          {
            role: "user",
            parts: [{ text: buildPrompt(decision) }],
          },
        ],
        config: {
          temperature: 0.2,
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              summary: { type: "string" },
              thesis: { type: "string" },
              risks: {
                type: "array",
                items: { type: "string" },
              },
              actionBias: {
                type: "string",
                enum: ["hold", "rebalance"],
              },
              confidence: { type: "number" },
            },
            required: [
              "summary",
              "thesis",
              "risks",
              "actionBias",
              "confidence",
            ],
          },
          safetySettings: this.getSafetySettings(),
        },
      });

      const text = this.getText(result);
      const thoughtTokens = this.getThoughtTokenCount(result);

      if (!text && thoughtTokens > 0) {
        throw new Error("empty_thought_response");
      }

      if (!text) {
        throw new Error("Could not extract text from Gemini response");
      }

      const parsed = JSON.parse(stripCodeFence(text)) as StrategyReasoning;
      return sanitizeReasoning(parsed);
    };

    return this.withRetry(operation);
  }
}

const geminiReasoningService = new GeminiReasoningService();

export async function generateStrategyReasoning(
  decision: AgentDecision,
): Promise<StrategyReasoning | null> {
  return geminiReasoningService.generateStrategyReasoning(decision);
}

function buildPrompt(decision: AgentDecision): string {
  const yields = Object.values(decision.yields)
    .sort((a, b) => b.supplyApr - a.supplyApr)
    .map(
      (item) =>
        `${item.chainName}: ${item.supplyApr.toFixed(2)}% APR, liquidity ${item.liquidity.toFixed(0)} ${item.symbol}`,
    )
    .join("\n");

  return [
    "You are Agent Lily, a DeFi strategy analyst for a cross-chain USDC yield system.",
    "You must provide reasoning only. You do not sign, broadcast, or execute transactions.",
    "Base your answer only on the supplied yield and route summary.",
    "Keep output concise and practical.",
    "",
    `Deterministic agent status: ${decision.status}`,
    `Deterministic message: ${decision.message}`,
    `Deterministic recommendation: ${decision.recommendation.action}`,
    `Current chain id: ${decision.currentChain}`,
    "",
    "Yields:",
    yields || "No yield data available.",
    "",
    "Route summary:",
    decision.recommendation.quote
      ? `From ${decision.recommendation.fromChain} to ${decision.recommendation.toChain}, estimated gas USD ${decision.recommendation.quote.gasCostUSD || "unknown"}, estimated output USD ${decision.recommendation.quote.toAmountUSD || "unknown"}`
      : "No route quote available.",
    "",
    "Return a JSON object with:",
    "- summary: one sentence",
    "- thesis: one short paragraph",
    "- risks: 2 to 4 short bullet-style strings",
    '- actionBias: "hold" or "rebalance"',
    "- confidence: number from 0 to 1",
  ].join("\n");
}

function stripCodeFence(text: string) {
  const trimmed = text.trim();
  if (!trimmed.startsWith("```")) {
    return trimmed;
  }

  return trimmed
    .replace(/^```(?:json)?\n?/, "")
    .replace(/\n?```$/, "")
    .trim();
}

function resolveSafetyThreshold(value: string | undefined) {
  switch (value) {
    case HarmBlockThreshold.HARM_BLOCK_THRESHOLD_UNSPECIFIED:
      return HarmBlockThreshold.HARM_BLOCK_THRESHOLD_UNSPECIFIED;
    case HarmBlockThreshold.BLOCK_LOW_AND_ABOVE:
      return HarmBlockThreshold.BLOCK_LOW_AND_ABOVE;
    case HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE:
      return HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE;
    case HarmBlockThreshold.BLOCK_ONLY_HIGH:
      return HarmBlockThreshold.BLOCK_ONLY_HIGH;
    case HarmBlockThreshold.BLOCK_NONE:
      return HarmBlockThreshold.BLOCK_NONE;
    case HarmBlockThreshold.OFF:
      return HarmBlockThreshold.OFF;
    default:
      return null;
  }
}

function sanitizeReasoning(value: StrategyReasoning): StrategyReasoning {
  const summary =
    typeof value.summary === "string" && value.summary.trim()
      ? value.summary.trim()
      : "No summary provided.";
  const thesis =
    typeof value.thesis === "string" && value.thesis.trim()
      ? value.thesis.trim()
      : "No thesis provided.";
  const risks = Array.isArray(value.risks)
    ? value.risks
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, 4)
    : [];
  const actionBias =
    value.actionBias === "rebalance" ? "rebalance" : "hold";
  const numericConfidence =
    typeof value.confidence === "number"
      ? value.confidence
      : Number.parseFloat(String(value.confidence));
  const confidence = Number.isFinite(numericConfidence)
    ? Math.min(1, Math.max(0, numericConfidence))
    : 0.5;

  return {
    summary,
    thesis,
    risks,
    actionBias,
    confidence,
  };
}
