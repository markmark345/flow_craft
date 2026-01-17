"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { RunDTO } from "@/types/dto";

interface DashboardSidebarProps {
  recentRuns: RunDTO[];
  showInfo: (title: string, message: string) => void;
}

export function DashboardSidebar({ recentRuns, showInfo }: DashboardSidebarProps) {
  return (
    <aside className="hidden lg:flex flex-col bg-panel border border-border rounded-xl shadow-soft overflow-hidden">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted">Activity Feed</h2>
          <div className="flex gap-2 text-xs">
            <Button
              variant="link"
              className="p-0 h-auto text-text font-medium text-xs no-underline hover:no-underline"
            >
              All
            </Button>
            <Button
              variant="link"
              className="p-0 h-auto text-muted hover:text-text transition-colors text-xs no-underline hover:no-underline font-normal"
              onClick={() => showInfo("Activity filters", "Personal filters are coming soon.")}
            >
              Mine
            </Button>
            <Button
              variant="link"
              className="p-0 h-auto text-muted hover:text-text transition-colors text-xs no-underline hover:no-underline font-normal"
              onClick={() => showInfo("Activity filters", "Error-only view is coming soon.")}
            >
              Errors
            </Button>
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
          <Link
            href="/docs"
            className="bg-surface2 border border-border rounded-lg p-4 block hover:bg-surface transition-colors"
          >
            <div className="text-sm font-semibold text-text">Browse Templates</div>
            <div className="text-xs text-muted mt-1">200+ pre-built workflows</div>
          </Link>
          <Link
            href="/docs"
            className="bg-surface2 border border-border rounded-lg p-4 block hover:bg-surface transition-colors"
          >
            <div className="text-sm font-semibold text-text">API Documentation</div>
            <div className="text-xs text-muted mt-1">Guides and references</div>
          </Link>
        </div>
      </div>
    </aside>
  );
}
