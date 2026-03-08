"use client";

import { DashboardShell } from "@/components/DashboardShell";
import { ActionButton, MetricTile, SectionCard, StatusPill } from "@/components/dashboard/ui";
import { useDashboardFeed } from "@/components/dashboard/useDashboardFeed";

export default function DashboardReportsPage() {
  const { report, runs, isLoading, refresh } = useDashboardFeed();

  return (
    <DashboardShell
      currentPage="reports"
      title="Weekly Reports"
      subtitle="Performance context, recent activity, and the narrative judges can understand quickly."
      actions={
        <ActionButton onClick={() => refresh()} disabled={isLoading} variant="secondary">
          Refresh
        </ActionButton>
      }
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricTile label="Executed" value={String(report?.executed ?? 0)} />
        <MetricTile label="Dry Runs" value={String(report?.dryRuns ?? 0)} />
        <MetricTile label="Skipped" value={String(report?.skipped ?? 0)} />
        <MetricTile label="Errors" value={String(report?.errors ?? 0)} />
        <MetricTile
          label="Projected Net"
          value={`$${(report?.projectedNetAnnualGainUsd ?? 0).toFixed(2)}`}
        />
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <SectionCard title="Latest Summary" subtitle="The one paragraph you can show in a demo.">
          <p className="text-sm leading-6 text-[#A0A0B0]">
            {report?.latestRun?.message || "No automation summary yet."}
          </p>
        </SectionCard>
        <SectionCard title="Recent Runs" subtitle="Stored activity across cron and manual operations.">
          <div className="mt-4 space-y-3">
            {runs.length ? (
              runs.slice(0, 8).map((run) => (
                <div
                  key={run.id}
                  className="rounded-[22px] border border-[#262633] bg-[#101018] p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <StatusPill tone="accent">
                      {run.status}
                    </StatusPill>
                    <span className="text-xs text-[#707083]">
                      {new Date(run.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-white">{run.message}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-[#707083]">No stored runs yet.</p>
            )}
          </div>
        </SectionCard>
      </div>
    </DashboardShell>
  );
}
