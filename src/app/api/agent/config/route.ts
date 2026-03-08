import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import {
  getAgentApiSecret,
  isAuthorizedAgentRequest,
} from "@/lib/agentApiAuth";
import {
  getStoredAgentConfig,
  saveAgentConfig,
} from "@/lib/persistence";

const agentConfigSchema = z.object({
  currentChainId: z.number().int().positive().optional(),
  positionUsdc: z.string().trim().min(1).regex(/^\d+(\.\d+)?$/).optional(),
  autoRebalanceEnabled: z.boolean().optional(),
  minYieldDeltaPct: z.number().nonnegative().nullable().optional(),
  minNetGainUsd: z.number().nonnegative().nullable().optional(),
  maxRouteCostUsd: z.number().nonnegative().nullable().optional(),
  cooldownMinutes: z.number().int().nonnegative().nullable().optional(),
  allowedDestinationChainIds: z.array(z.number().int().positive()).nullable().optional(),
  blockedChainIds: z.array(z.number().int().positive()).nullable().optional(),
  alertWebhookUrl: z.string().url().nullable().optional(),
  telegramBotToken: z.string().trim().min(1).nullable().optional(),
  telegramChatId: z.string().trim().min(1).nullable().optional(),
  telegramEnabled: z.boolean().nullable().optional(),
});

function unauthorizedResponse() {
  const secret = getAgentApiSecret();

  return NextResponse.json(
    {
      status: "error",
      message: secret
        ? "Unauthorized agent request."
        : "AGENT_API_SECRET or CRON_SECRET is not configured.",
    },
    { status: secret ? 401 : 503 },
  );
}

export async function GET(request: NextRequest) {
  if (!isAuthorizedAgentRequest(request)) {
    return unauthorizedResponse();
  }

  const config = await getStoredAgentConfig();
  return NextResponse.json({
    status: "ok",
    config,
  });
}

export async function POST(request: NextRequest) {
  if (!isAuthorizedAgentRequest(request)) {
    return unauthorizedResponse();
  }

  const rawPayload = await request.json();
  const parsedPayload = agentConfigSchema.safeParse(rawPayload);

  if (!parsedPayload.success) {
    return NextResponse.json(
      {
        status: "error",
        message: "Invalid agent config payload.",
        issues: parsedPayload.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      },
      { status: 400 },
    );
  }

  const payload = parsedPayload.data;
  const existingConfig = await getStoredAgentConfig();
  const savedConfig = await saveAgentConfig({
    id: "default",
    currentChainId: payload.currentChainId ?? existingConfig?.currentChainId ?? 42161,
    positionUsdc: payload.positionUsdc ?? existingConfig?.positionUsdc ?? "100",
    autoRebalanceEnabled:
      payload.autoRebalanceEnabled ?? existingConfig?.autoRebalanceEnabled ?? false,
    minYieldDeltaPct:
      payload.minYieldDeltaPct !== undefined
        ? payload.minYieldDeltaPct
        : existingConfig?.minYieldDeltaPct ?? null,
    minNetGainUsd:
      payload.minNetGainUsd !== undefined
        ? payload.minNetGainUsd
        : existingConfig?.minNetGainUsd ?? null,
    maxRouteCostUsd:
      payload.maxRouteCostUsd !== undefined
        ? payload.maxRouteCostUsd
        : existingConfig?.maxRouteCostUsd ?? null,
    cooldownMinutes:
      payload.cooldownMinutes !== undefined
        ? payload.cooldownMinutes
        : existingConfig?.cooldownMinutes ?? null,
    allowedDestinationChainIds:
      payload.allowedDestinationChainIds !== undefined
        ? payload.allowedDestinationChainIds
        : existingConfig?.allowedDestinationChainIds ?? null,
    blockedChainIds:
      payload.blockedChainIds !== undefined
        ? payload.blockedChainIds
        : existingConfig?.blockedChainIds ?? null,
    alertWebhookUrl:
      payload.alertWebhookUrl !== undefined
        ? payload.alertWebhookUrl
        : existingConfig?.alertWebhookUrl ?? null,
    telegramBotToken:
      payload.telegramBotToken !== undefined
        ? payload.telegramBotToken
        : existingConfig?.telegramBotToken ?? null,
    telegramChatId:
      payload.telegramChatId !== undefined
        ? payload.telegramChatId
        : existingConfig?.telegramChatId ?? null,
    telegramEnabled:
      payload.telegramEnabled !== undefined
        ? payload.telegramEnabled
        : existingConfig?.telegramEnabled ?? null,
  });

  if (!savedConfig) {
    return NextResponse.json(
      {
        status: "error",
        message:
          "Supabase is not configured or the config could not be persisted.",
      },
      { status: 503 },
    );
  }

  return NextResponse.json({
    status: "ok",
    config: savedConfig,
  });
}
