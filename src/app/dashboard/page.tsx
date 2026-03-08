"use client";

import Link from "next/link";

import { DashboardShell } from "@/components/DashboardShell";
import {
  ActionButton,
  MetricTile,
  SectionCard,
  StatusPill,
} from "@/components/dashboard/ui";
import { useDashboardFeed } from "@/components/dashboard/useDashboardFeed";

const PAGES = [
  {
    href: "/dashboard/approvals",
    title: "Approval Inbox",
    description: "Review Lily's dry-run opportunities before you act.",
  },
  {
    href: "/dashboard/reports",
    title: "Weekly Reports",
    description: "Summaries, recent run history, and judge-friendly performance context.",
  },
  {
    href: "/dashboard/chat",
    title: "Chat Workspace",
    description: "Talk to Lily directly when you want a conversational execution flow.",
  },
];

export default function DashboardOverviewPage() {
  const { report, runs, isLoading, refresh } = useDashboardFeed();

  return (
    <DashboardShell
      currentPage="dashboard"
      title="Agent Lily Dashboard"
      subtitle="A modular control room for approvals, reports, and chat."
      actions={
        <ActionButton onClick={() => refresh()} disabled={isLoading} variant="secondary">
          Refresh
        </ActionButton>
      }
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricTile label="Runs" value={String(report?.sampleSize ?? 0)} />
        <MetricTile label="Executed" value={String(report?.executed ?? 0)} />
        <MetricTile
          label="Pending"
          value={String(runs.filter((run) => run.status === "dry_run").length)}
          accent="text-[#fab6f5]"
        />
        <MetricTile
          label="Projected Net"
          value={`$${(report?.projectedNetAnnualGainUsd ?? 0).toFixed(2)}`}
        />
        <MetricTile label="Latest Status" value={report?.latestRun?.status || "Idle"} />
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <SectionCard
          title="Workspace Modules"
          subtitle="Each feature now lives in its own page, so the product feels structured instead of overloaded."
        >
          <div className="grid gap-4 lg:grid-cols-2">
            {PAGES.map((page) => (
              <Link
                key={page.href}
                href={page.href}
                className="rounded-[24px] border border-[#262633] bg-[#101018] p-5 transition-colors hover:border-[#fab6f5]/40"
              >
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-base font-semibold text-white">{page.title}</h2>
                  <StatusPill tone="accent">Open</StatusPill>
                </div>
                <p className="mt-3 text-sm leading-6 text-[#8F90A6]">
                  {page.description}
                </p>
              </Link>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Operator Snapshot"
          subtitle="Fast context for demos and live operations."
        >
          <div className="space-y-4">
            <div className="rounded-[24px] border border-[#262633] bg-[#101018] p-5">
              <div className="text-[11px] uppercase tracking-[0.24em] text-[#72738A]">
                Latest Run
              </div>
              <div className="mt-3 flex items-center gap-3">
                <StatusPill tone="accent">
                  {report?.latestRun?.status || "idle"}
                </StatusPill>
                <span className="text-sm leading-6 text-[#8F90A6]">
                  {report?.latestRun?.message || "No run recorded yet."}
                </span>
              </div>
            </div>
            <div className="rounded-[24px] border border-[#262633] bg-[#101018] p-5 text-sm leading-6 text-[#8F90A6]">
              Agent Lily now operates through dedicated workspaces for approvals,
              reports, and chat. Admin controls stay outside the normal user
              path, so this reads like a product instead of an internal panel.
            </div>
          </div>
        </SectionCard>
      </div>
    </DashboardShell>
  );
}
