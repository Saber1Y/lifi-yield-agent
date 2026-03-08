import type { AutomationResult } from "./automation";
import { decryptConfigValue, encryptConfigValue } from "./configCrypto";
import { getSupabaseAdminClient } from "./supabaseAdmin";

export interface StoredAgentConfig {
  id: string;
  currentChainId: number;
  positionUsdc: string;
  autoRebalanceEnabled: boolean;
  minYieldDeltaPct?: number | null;
  minNetGainUsd?: number | null;
  maxRouteCostUsd?: number | null;
  cooldownMinutes?: number | null;
  allowedDestinationChainIds?: number[] | null;
  blockedChainIds?: number[] | null;
  alertWebhookUrl?: string | null;
  telegramBotToken?: string | null;
  telegramChatId?: string | null;
  telegramEnabled?: boolean | null;
  updatedAt?: string | null;
}

export interface StoredAutomationRun {
  id: string;
  createdAt: string;
  triggerSource: string;
  status: string;
  mode: string;
  currentChainId: number;
  amountUsdc: string;
  message: string;
  routeId?: string | null;
  txLinks: string[];
  details: Record<string, unknown>;
  reasoning?: Record<string, unknown> | null;
}

interface AgentConfigRow {
  id: string;
  current_chain_id: number;
  position_usdc: string;
  auto_rebalance_enabled: boolean;
  min_yield_delta_pct?: number | null;
  min_net_gain_usd?: number | null;
  max_route_cost_usd?: number | null;
  cooldown_minutes?: number | null;
  allowed_destination_chain_ids?: number[] | null;
  blocked_chain_ids?: number[] | null;
  alert_webhook_url?: string | null;
  telegram_bot_token?: string | null;
  telegram_chat_id?: string | null;
  telegram_enabled?: boolean | null;
  updated_at?: string | null;
}

interface AgentRunRow {
  id: string;
  created_at: string;
  trigger_source: string;
  status: string;
  mode: string;
  current_chain_id: number;
  amount_usdc: string;
  message: string;
  route_id?: string | null;
  tx_links?: string[] | null;
  details?: Record<string, unknown> | null;
  reasoning?: Record<string, unknown> | null;
}

export async function getStoredAgentConfig(): Promise<StoredAgentConfig | null> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("agent_configs")
    .select(
      "id, current_chain_id, position_usdc, auto_rebalance_enabled, min_yield_delta_pct, min_net_gain_usd, max_route_cost_usd, cooldown_minutes, allowed_destination_chain_ids, blocked_chain_ids, alert_webhook_url, telegram_bot_token, telegram_chat_id, telegram_enabled, updated_at",
    )
    .eq("id", "default")
    .maybeSingle<AgentConfigRow>();

  if (error) {
    console.error("Failed to load agent config", error);
    return null;
  }

  if (!data) {
    return null;
  }

  try {
    return mapAgentConfigRow(data);
  } catch (error) {
    console.error("Failed to decode stored agent config", error);
    return null;
  }
}

export async function saveAgentConfig(
  config: StoredAgentConfig,
): Promise<StoredAgentConfig | null> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return null;
  }

  let row: AgentConfigRow;
  try {
    row = {
      id: config.id,
      current_chain_id: config.currentChainId,
      position_usdc: config.positionUsdc,
      auto_rebalance_enabled: config.autoRebalanceEnabled,
      min_yield_delta_pct: config.minYieldDeltaPct ?? null,
      min_net_gain_usd: config.minNetGainUsd ?? null,
      max_route_cost_usd: config.maxRouteCostUsd ?? null,
      cooldown_minutes: config.cooldownMinutes ?? null,
      allowed_destination_chain_ids: config.allowedDestinationChainIds ?? null,
      blocked_chain_ids: config.blockedChainIds ?? null,
      alert_webhook_url: config.alertWebhookUrl ?? null,
      telegram_bot_token: encryptConfigValue(config.telegramBotToken ?? null),
      telegram_chat_id: encryptConfigValue(config.telegramChatId ?? null),
      telegram_enabled: config.telegramEnabled ?? null,
    };
  } catch (error) {
    console.error("Failed to encrypt agent config", error);
    return null;
  }

  const { data, error } = await supabase
    .from("agent_configs")
    .upsert(row, { onConflict: "id" })
    .select(
      "id, current_chain_id, position_usdc, auto_rebalance_enabled, min_yield_delta_pct, min_net_gain_usd, max_route_cost_usd, cooldown_minutes, allowed_destination_chain_ids, blocked_chain_ids, alert_webhook_url, telegram_bot_token, telegram_chat_id, telegram_enabled, updated_at",
    )
    .single<AgentConfigRow>();

  if (error) {
    console.error("Failed to save agent config", error);
    return null;
  }

  try {
    return mapAgentConfigRow(data);
  } catch (error) {
    console.error("Failed to decode saved agent config", error);
    return null;
  }
}

export async function persistAutomationRun(params: {
  triggerSource: "manual" | "cron";
  result: AutomationResult;
}) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return;
  }

  const { error } = await supabase.from("agent_runs").insert({
    trigger_source: params.triggerSource,
    status: params.result.status,
    mode: params.result.mode,
    current_chain_id: params.result.currentChainId,
    amount_usdc: params.result.amountUsdc,
    message: params.result.message,
    route_id: params.result.routeId ?? null,
    tx_links: params.result.txLinks ?? [],
    details: params.result.details ?? {},
    reasoning: params.result.reasoning ?? null,
    created_at: params.result.timestamp,
  });

  if (error) {
    console.error("Failed to persist automation run", error);
  }
}

export async function getRecentAutomationRuns(
  limit = 10,
): Promise<StoredAutomationRun[]> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("agent_runs")
    .select(
      "id, created_at, trigger_source, status, mode, current_chain_id, amount_usdc, message, route_id, tx_links, details, reasoning",
    )
    .order("created_at", { ascending: false })
    .limit(limit)
    .returns<AgentRunRow[]>();

  if (error) {
    console.error("Failed to fetch automation runs", error);
    return [];
  }

  return (data || []).map(mapRunRow);
}

export async function getLastExecutionTimestamp(): Promise<string | null> {
  const runs = await getRecentAutomationRuns(20);
  const recentExecution = runs.find(
    (run) => run.status === "executed" || run.mode === "execution",
  );
  return recentExecution?.createdAt ?? null;
}

function mapAgentConfigRow(row: AgentConfigRow): StoredAgentConfig {
  return {
    id: row.id,
    currentChainId: row.current_chain_id,
    positionUsdc: row.position_usdc,
    autoRebalanceEnabled: row.auto_rebalance_enabled,
    minYieldDeltaPct: row.min_yield_delta_pct ?? null,
    minNetGainUsd: row.min_net_gain_usd ?? null,
    maxRouteCostUsd: row.max_route_cost_usd ?? null,
    cooldownMinutes: row.cooldown_minutes ?? null,
    allowedDestinationChainIds: row.allowed_destination_chain_ids ?? null,
    blockedChainIds: row.blocked_chain_ids ?? null,
    alertWebhookUrl: row.alert_webhook_url ?? null,
    telegramBotToken: decryptConfigValue(row.telegram_bot_token ?? null),
    telegramChatId: decryptConfigValue(row.telegram_chat_id ?? null),
    telegramEnabled: row.telegram_enabled ?? null,
    updatedAt: row.updated_at ?? null,
  };
}

function mapRunRow(row: AgentRunRow): StoredAutomationRun {
  return {
    id: row.id,
    createdAt: row.created_at,
    triggerSource: row.trigger_source,
    status: row.status,
    mode: row.mode,
    currentChainId: row.current_chain_id,
    amountUsdc: row.amount_usdc,
    message: row.message,
    routeId: row.route_id ?? null,
    txLinks: row.tx_links ?? [],
    details: row.details ?? {},
    reasoning: row.reasoning ?? null,
  };
}
