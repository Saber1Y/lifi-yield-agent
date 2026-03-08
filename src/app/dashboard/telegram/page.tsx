"use client";

import { DashboardShell } from "@/components/DashboardShell";
import {
  ActionButton,
  SectionCard,
  TextField,
} from "@/components/dashboard/ui";
import { useAgentOps } from "@/components/dashboard/useAgentOps";

export default function DashboardTelegramPage() {
  const {
    opsSecret,
    setOpsSecret,
    opsConfig,
    setOpsConfig,
    saveConfig,
    isLoading,
  } = useAgentOps();

  return (
    <DashboardShell
      currentPage="telegram"
      title="Deploy Lily to Telegram"
      subtitle="Connect a bot token and chat id so Lily can send live operator alerts from the same backend."
      actions={
        <ActionButton onClick={saveConfig} disabled={isLoading}>
          Save Telegram Setup
        </ActionButton>
      }
    >
      <SectionCard
        title="Telegram Deployment"
        subtitle="Give Lily a bot identity so she can operate where the user already lives."
      >
        <p className="mb-4 rounded-2xl border border-[#2B2B39] bg-[#101018] px-4 py-3 text-sm text-[#A0A0B0]">
          Admin-only setup. Telegram credentials are encrypted on the server before they are persisted.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <TextField
            label="Agent Admin Token"
            type="password"
            value={opsSecret}
            onChange={setOpsSecret}
            placeholder="AGENT_API_SECRET or CRON_SECRET"
          />
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <TextField
            label="Telegram Bot Token"
            type="password"
            value={opsConfig.telegramBotToken ?? ""}
            onChange={(value) =>
              setOpsConfig((prev) => ({ ...prev, telegramBotToken: value }))
            }
          />
          <TextField
            label="Telegram Chat ID"
            value={opsConfig.telegramChatId ?? ""}
            onChange={(value) =>
              setOpsConfig((prev) => ({ ...prev, telegramChatId: value }))
            }
          />
        </div>
        <label className="mt-4 flex items-center gap-3 rounded-2xl border border-[#2B2B39] bg-[#101018] px-4 py-3 text-sm text-white">
          <input
            type="checkbox"
            checked={Boolean(opsConfig.telegramEnabled)}
            onChange={(e) =>
              setOpsConfig((prev) => ({ ...prev, telegramEnabled: e.target.checked }))
            }
          />
          Enable Telegram alerts
        </label>
        <p className="mt-4 text-sm text-[#A0A0B0]">
          This deploys Lily as an outbound operator bot first. The same saved bot identity can later be extended with inbound webhook commands.
        </p>
      </SectionCard>
    </DashboardShell>
  );
}
