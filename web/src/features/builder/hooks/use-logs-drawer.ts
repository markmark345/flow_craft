import { useEffect, useMemo, useRef } from "react";
import { useAppStore } from "@/shared/hooks/use-app-store";
import { useBuilderStore } from "../store/use-builder-store";
import { useRunDetailQuery } from "@/features/runs/hooks/use-run-detail";

export interface UseLogsDrawerReturn {
  flowId: string | undefined;
  runId: string | undefined;
  run: any;
  loading: boolean;
  reload: () => Promise<void>;
  logText: string;
  logRef: React.RefObject<HTMLPreElement>;
  onClear: () => void;
  onDownload: () => void;
  tone: (status?: string) => "default" | "success" | "warning" | "danger";
}

/**
 * Custom hook for managing logs drawer state and interactions.
 * Handles run logs display, auto-scroll, download, and status badge colors.
 */
export function useLogsDrawer(): UseLogsDrawerReturn {
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

  return {
    flowId,
    runId,
    run,
    loading,
    reload,
    logText,
    logRef,
    onClear,
    onDownload,
    tone,
  };
}
