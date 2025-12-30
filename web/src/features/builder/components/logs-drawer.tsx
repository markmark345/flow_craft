"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";
import { Badge } from "@/shared/components/badge";
import { useAppStore } from "@/shared/hooks/use-app-store";
import { useBuilderStore } from "../store/use-builder-store";
import { useRunDetailQuery } from "@/features/runs/hooks/use-run-detail";
import { Icon } from "@/shared/components/icon";

export function LogsDrawer() {
  const flowId = useBuilderStore((s) => s.flowId);
  const activeRunId = useBuilderStore((s) => s.activeRunId);
  const setActiveRunId = useBuilderStore((s) => s.setActiveRunId);
  const showInfo = useAppStore((s) => s.showInfo);

  const runId = activeRunId;
  const { run, loading, reload } = useRunDetailQuery(runId, { pollMs: 2000 });

  const logText = useMemo(() => (run?.log ? run.log : ""), [run?.log]);
  const logRef = useRef<HTMLPreElement | null>(null);

  useEffect(() => {
    if (!logRef.current) return;
    logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logText]);

  const onClear = () => {
    setActiveRunId(undefined);
    showInfo("Logs cleared");
  };

  const onDownload = () => {
    if (!run) return;
    const text = run.log || "";
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `run-${run.id}.log.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const tone = (status?: string): "default" | "success" | "warning" | "danger" => {
    if (status === "success") return "success";
    if (status === "failed") return "danger";
    if (status === "running" || status === "queued") return "warning";
    return "default";
  };

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
          <button
            type="button"
            className="p-1.5 text-muted hover:text-text hover:bg-surface rounded transition-colors"
            title="Clear Logs"
            onClick={onClear}
            disabled={!runId && !run}
          >
            <Icon name="delete" className="text-[16px]" />
          </button>
          <button
            type="button"
            className="p-1.5 text-muted hover:text-text hover:bg-surface rounded transition-colors"
            title="Download"
            onClick={onDownload}
            disabled={!run?.log}
          >
            <Icon name="download" className="text-[16px]" />
          </button>
          <button
            type="button"
            className="p-1.5 text-muted hover:text-text hover:bg-surface rounded transition-colors"
            title="Refresh"
            onClick={() => void reload()}
            disabled={!runId || loading}
          >
            <Icon name="refresh" className="text-[16px]" />
          </button>
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
