"use client";

import Link from "next/link";

import { DashboardShell } from "@/components/DashboardShell";
import {
  ActionButton,
  EmptyState,
  SectionCard,
  StatusPill,
} from "@/components/dashboard/ui";
import { useDashboardFeed } from "@/components/dashboard/useDashboardFeed";

export default function DashboardApprovalsPage() {
  const { runs, isLoading, refresh } = useDashboardFeed();
  const approvalItems = runs.filter((run) => run.status === "dry_run");

  return (
    <DashboardShell
      currentPage="approvals"
      title="Approval Inbox"
      subtitle="Review Lily's latest dry-run recommendations before you trigger a real move."
      actions={
        <ActionButton onClick={() => refresh()} disabled={isLoading} variant="secondary">
          Refresh
        </ActionButton>
      }
    >
      <SectionCard
        title="Pending Recommendations"
        subtitle="These are dry-run opportunities that Lily flagged as worth reviewing."
      >
        <div className="space-y-4">
        {approvalItems.length ? (
          approvalItems.map((run) => (
            <div
              key={run.id}
              className="rounded-[24px] border border-[#262633] bg-[#101018] p-6"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold leading-6 text-white">{run.message}</div>
                  <div className="mt-2 text-xs text-[#707083]">
                    {new Date(run.createdAt).toLocaleString()} • {run.triggerSource}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusPill tone="accent">Needs review</StatusPill>
                  {typeof run.details?.reviewCommand === "string" ? (
                    <Link
                      href={`/dashboard/chat?command=${encodeURIComponent(run.details.reviewCommand)}`}
                      className="rounded-xl bg-[#fab6f5] px-3 py-2 text-sm font-semibold text-black"
                    >
                      Review in Chat
                    </Link>
                  ) : null}
                </div>
              </div>
            </div>
          ))
        ) : (
          <EmptyState text="No approval items yet. Trigger a dry-run or wait for the next cron recommendation." />
        )}
        </div>
      </SectionCard>
    </DashboardShell>
  );
}
