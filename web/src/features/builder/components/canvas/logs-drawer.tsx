"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { IconButton } from "@/components/ui/icon-button";
import { useLogsDrawer } from "../../hooks/use-logs-drawer";

export function LogsDrawer() {
  const { flowId, runId, run, loading, reload, logText, logRef, onClear, onDownload, tone } = useLogsDrawer();

  return (
    <div className="h-56 bg-panel border-t border-border flex flex-col shrink-0 shadow-[0_-4px_24px_-12px_rgba(0,0,0,0.1)]">
      <div className="h-10 px-4 flex items-center justify-between bg-surface2 border-b border-border">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Icon name="terminal" className="text-[18px] text-muted" />
            <span className="text-xs font-bold uppercase tracking-wider text-muted">
              Execution Logs
            </span>
          </div>
          {run ? (
            <div className="flex items-center gap-2">
              <Badge label={run.status} tone={tone(run.status)} />
              <Link href={`/runs/${run.id}`} className="text-xs text-accent hover:underline">
                {run.id.slice(0, 8)}
              </Link>
            </div>
          ) : null}
        </div>
        <div className="flex items-center gap-1">
          <IconButton
            icon="delete"
            className="p-1.5 text-muted hover:text-text hover:bg-surface rounded transition-colors"
            title="Clear Logs"
            onClick={onClear}
            disabled={!runId && !run}
          />
          <IconButton
            icon="download"
            className="p-1.5 text-muted hover:text-text hover:bg-surface rounded transition-colors"
            title="Download"
            onClick={onDownload}
            disabled={!run?.log}
          />
          <IconButton
            icon="refresh"
            className="p-1.5 text-muted hover:text-text hover:bg-surface rounded transition-colors"
            title="Refresh"
            onClick={() => void reload()}
            disabled={!runId || loading}
          />
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4 text-xs text-muted font-mono fc-scrollbar">
        {!flowId ? (
          "No flow loaded."
        ) : !runId ? (
          "No logs yet. Run the flow to see execution output."
        ) : loading && !run ? (
          "Loading logs..."
        ) : run ? (
          <pre ref={logRef} className="whitespace-pre-wrap text-xs text-text font-mono">
            {logText || "No log output yet."}
          </pre>
        ) : (
          "Run not found."
        )}
      </div>
    </div>
  );
}
