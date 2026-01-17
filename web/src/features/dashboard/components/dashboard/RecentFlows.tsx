"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import type { FlowDTO } from "@/types/dto";

interface RecentFlowsProps {
  recentFlows: FlowDTO[];
  navigateToFlow: (id: string) => void;
}

export function RecentFlows({ recentFlows, navigateToFlow }: RecentFlowsProps) {
  return (
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
            onClick={() => navigateToFlow(flow.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter") navigateToFlow(flow.id);
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
  );
}
