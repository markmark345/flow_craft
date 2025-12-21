"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Badge } from "@/shared/components/badge";
import { Button } from "@/shared/components/button";
import { useFlowsQuery } from "@/features/flows/hooks/use-flows";
import { useFlowsStore } from "@/features/flows/store/use-flows-store";
import { useRunsQuery } from "@/features/runs/hooks/use-runs";
import { useRunsStore } from "@/features/runs/store/use-runs-store";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/shared/hooks/use-app-store";
import { Icon } from "@/shared/components/icon";

export function DashboardPage() {
  useFlowsQuery();
  useRunsQuery();
  const flows = useFlowsStore((s) => s.items);
  const runs = useRunsStore((s) => s.items);
  const router = useRouter();
  const showInfo = useAppStore((s) => s.showInfo);

  const recentFlows = useMemo(
    () => [...flows].sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || "")).slice(0, 5),
    [flows]
  );

  const recentRuns = useMemo(
    () => [...runs].sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || "")).slice(0, 6),
    [runs]
  );

  return (
    <div className="min-h-screen bg-bg">
      <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-text tracking-tight">Dashboard</h1>
            <p className="text-sm text-muted mt-1">Overview of your automation landscape.</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              size="sm"
              className="h-9 px-4 rounded-lg"
              onClick={() => showInfo("Filters", "Dashboard filters are coming soon.")}
            >
              <Icon name="filter_list" className="text-[18px] mr-2" />
              Filter
            </Button>
            <Link href="/flows/new">
              <Button size="sm" className="h-9 px-4 rounded-lg">
                <Icon name="add" className="text-[18px] mr-2" />
                New Flow
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 items-start">
          <div className="space-y-8">
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-text">Recent Flows</h2>
                <Link className="text-sm font-medium text-accent hover:underline flex items-center" href="/flows">
                  View all flows <Icon name="arrow_forward" className="text-[16px] ml-1" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {recentFlows.length === 0 ? (
                  <div className="md:col-span-2 xl:col-span-3 bg-panel border border-border rounded-lg p-4 text-sm text-muted">
                    No flows yet. Create your first automation.
                  </div>
                ) : null}
                {recentFlows.map((flow) => (
                  <div
                    key={flow.id}
                    className="group bg-panel rounded-lg border border-border p-4 shadow-soft hover:shadow-lift hover:border-accent transition-all cursor-pointer relative"
                    role="button"
                    tabIndex={0}
                    onClick={() => router.push(`/flows/${flow.id}/builder`)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") router.push(`/flows/${flow.id}/builder`);
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-2 rounded bg-surface2 text-accent">
                        <Icon name="account_tree" className="text-[20px]" />
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <Link
                          href={`/flows/${flow.id}/builder`}
                          className="p-1 hover:bg-surface2 rounded text-muted hover:text-accent"
                          title="Edit"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Icon name="edit" className="text-[16px]" />
                        </Link>
                      </div>
                    </div>
                    <h3 className="font-semibold text-text mb-1 truncate">{flow.name}</h3>
                    <div className="flex items-center gap-2 mb-4">
                      <Badge
                        label={flow.status}
                        tone={flow.status === "active" ? "success" : flow.status === "archived" ? "warning" : "default"}
                      />
                      <span className="text-xs text-muted">•</span>
                      <span className="text-xs text-muted">v{flow.version}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted border-t border-border pt-3 mt-auto">
                      <span className="flex items-center gap-1">
                        <Icon name="schedule" className="text-[16px] text-muted" />
                        {flow.updatedAt || "—"}
                      </span>
                      <span className="font-mono">id: {flow.id.slice(0, 5)}</span>
                    </div>
                  </div>
                ))}

                <Link
                  href="/flows/new"
                  className="group flex flex-col items-center justify-center p-4 rounded-lg border-2 border-dashed border-border bg-transparent hover:bg-surface2 hover:border-accent transition-all text-center"
                >
                  <div className="size-10 rounded-full bg-surface2 group-hover:bg-panel flex items-center justify-center mb-3 transition-colors border border-border">
                    <Icon name="add" className="text-[20px] text-muted group-hover:text-accent" />
                  </div>
                  <h3 className="text-sm font-semibold text-text">Create New Flow</h3>
                  <p className="text-xs text-muted mt-1">Start from scratch or template</p>
                </Link>
              </div>
            </section>
          </div>

          <aside className="hidden lg:flex flex-col bg-panel border border-border rounded-xl shadow-soft overflow-hidden">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-muted">Activity Feed</h2>
                <div className="flex gap-2 text-xs">
                  <button className="text-text font-medium">All</button>
                  <button
                    className="text-muted hover:text-text transition-colors"
                    onClick={() => showInfo("Activity filters", "Personal filters are coming soon.")}
                  >
                    Mine
                  </button>
                  <button
                    className="text-muted hover:text-text transition-colors"
                    onClick={() => showInfo("Activity filters", "Error-only view is coming soon.")}
                  >
                    Errors
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {recentRuns.length === 0 ? (
                  <div className="text-sm text-muted">No activity yet.</div>
                ) : (
                  recentRuns.map((run) => (
                    <Link
                      key={run.id}
                      href={`/runs/${run.id}`}
                      className="flex gap-3 items-start hover:bg-surface2 rounded-lg p-2 -m-2 transition-colors"
                    >
                      <div className="size-8 rounded-full bg-surface2 border border-border shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-text leading-snug">
                          Run <span className="font-mono">{run.id.slice(0, 6)}</span> on{" "}
                          <span className="font-mono">{run.flowId.slice(0, 6)}</span>
                        </p>
                        <div className="text-xs text-muted mt-1">{run.status}</div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>

            <div className="p-6 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted">Templates &amp; Resources</h3>
              <div className="space-y-3">
                <Link href="/docs" className="bg-surface2 border border-border rounded-lg p-4 block hover:bg-surface transition-colors">
                  <div className="text-sm font-semibold text-text">Browse Templates</div>
                  <div className="text-xs text-muted mt-1">200+ pre-built workflows</div>
                </Link>
                <Link href="/docs" className="bg-surface2 border border-border rounded-lg p-4 block hover:bg-surface transition-colors">
                  <div className="text-sm font-semibold text-text">API Documentation</div>
                  <div className="text-xs text-muted mt-1">Guides and references</div>
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
