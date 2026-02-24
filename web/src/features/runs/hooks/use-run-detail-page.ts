import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useRunDetailQuery } from "./use-run-detail";
import { useRunStepsQuery } from "./use-run-steps";
import { useCancelRun } from "./use-cancel-run";
import { useRunFlow } from "./use-run-flow";
import { useFlowDetailQuery } from "@/features/flows/hooks/use-flow-detail";
import { useAppStore } from "@/hooks/use-app-store";
import type { RunDTO, RunStepDTO } from "@/types/dto";
import { useWebSocket, RunUpdateEvent } from "@/hooks/use-websocket";
import { useQueryClient } from "@tanstack/react-query";

export interface UseRunDetailPageReturn {
  // Data
  run: ReturnType<typeof useRunDetailQuery>["run"];
  flow: ReturnType<typeof useFlowDetailQuery>["flow"];
  steps: RunStepDTO[];
  selectedStep: RunStepDTO | undefined;

  // Loading states
  runLoading: boolean;
  stepsLoading: boolean;
  runError: string | undefined;
  stepsError: string | undefined;
  canceling: boolean;
  running: boolean;
  runningFlowId: string | undefined;

  // UI state
  activeTab: "inputs" | "outputs" | "logs" | "errors";
  selectedStepId: string | undefined;
  logQuery: string;
  cancelable: boolean;

  // Actions
  setActiveTab: (tab: "inputs" | "outputs" | "logs" | "errors") => void;
  setSelectedStepId: (id: string | undefined) => void;
  setLogQuery: (query: string) => void;
  refreshAll: () => Promise<void>;
  reloadSteps: () => Promise<void>;
  onCancel: () => Promise<void>;
  onRerun: () => Promise<void>;
  getTone: (status: RunDTO["status"]) => "default" | "success" | "warning" | "danger";
  getTabText: (step: RunStepDTO | undefined, tab: "inputs" | "outputs" | "logs" | "errors") => string;
  filterLogText: (text: string) => string;
  showInfo: ReturnType<typeof useAppStore.getState>["showInfo"];
  showSuccess: ReturnType<typeof useAppStore.getState>["showSuccess"];
  showError: ReturnType<typeof useAppStore.getState>["showError"];
}

/**
 * Custom hook for managing Run Detail Page state and logic.
 * Handles run execution viewing, step navigation, and run control actions.
 */
export function useRunDetailPage(runId: string): UseRunDetailPageReturn {
  const router = useRouter();

  // Data queries
  // Initial fetch only, no polling. Real-time updates handled via WebSocket.
  const { run, loading: runLoading, error: runError, reload: reloadRun } = useRunDetailQuery(runId);
  const { steps, loading: stepsLoading, error: stepsError, reload: reloadSteps } = useRunStepsQuery(runId);
  const { cancel, canceling } = useCancelRun();
  const { startRun, running, runningFlowId } = useRunFlow();
  const { flow } = useFlowDetailQuery(run?.flowId);

  // Real-time updates
  const { subscribe } = useWebSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    return subscribe("run_update", (payload: RunUpdateEvent) => {
      if (payload.runId === runId) {
        // Reload run and steps when our run updates
        reloadRun();
        reloadSteps();
        
        // Also invalidate globally to ensure freshness
        queryClient.invalidateQueries({ queryKey: ["run", runId] });
        queryClient.invalidateQueries({ queryKey: ["run-steps", runId] });
      }
    });
  }, [runId, subscribe, reloadRun, reloadSteps, queryClient]);

  // UI messages
  const showSuccess = useAppStore((s) => s.showSuccess);
  const showError = useAppStore((s) => s.showError);
  const showInfo = useAppStore((s) => s.showInfo);

  // Local state
  const [activeTab, setActiveTab] = useState<"inputs" | "outputs" | "logs" | "errors">("outputs");
  const [selectedStepId, setSelectedStepId] = useState<string | undefined>(undefined);
  const [logQuery, setLogQuery] = useState("");

  // Auto-select first step
  useEffect(() => {
    if (!steps.length) return;
    if (selectedStepId && steps.some((s) => s.id === selectedStepId)) return;
    setSelectedStepId(steps[0].id);
  }, [selectedStepId, steps]);

  // Get selected step
  const selectedStep = useMemo<RunStepDTO | undefined>(() => {
    if (!steps.length) return undefined;
    return steps.find((s) => s.id === selectedStepId) || steps[0];
  }, [selectedStepId, steps]);

  // Actions
  const refreshAll = async () => {
    await Promise.all([reloadRun(), reloadSteps()]);
  };

  const cancelable = run?.status === "queued" || run?.status === "running";

  const onCancel = async () => {
    if (!run) return;
    try {
      await cancel(run.id);
      await refreshAll();
    } catch {}
  };

  const onRerun = async () => {
    if (!run) return;
    try {
      const created = await startRun(run.flowId);
      showSuccess("Run started", "Redirecting to run detail…");
      router.push(`/runs/${created.id}`);
    } catch {}
  };

  const getTone = (s: RunDTO["status"]): "default" | "success" | "warning" | "danger" => {
    if (s === "success") return "success";
    if (s === "failed") return "danger";
    if (s === "running" || s === "queued") return "warning";
    return "default";
  };

  const getTabText = (step: RunStepDTO | undefined, tab: "inputs" | "outputs" | "logs" | "errors"): string => {
    if (!step) return "";
    if (tab === "inputs") return pretty(step.inputs);
    if (tab === "outputs") return pretty(step.outputs);
    if (tab === "logs") return [step.log, run?.log].filter(Boolean).join("\n");
    return step.error || (step.status === "failed" ? "Step failed" : "");
  };

  const filterLogText = (text: string): string => {
    const q = logQuery.trim().toLowerCase();
    if (!q) return text;
    const lines = text.split("\n");
    const filtered = lines.filter((l) => l.toLowerCase().includes(q));
    return filtered.join("\n");
  };

  return {
    // Data
    run,
    flow,
    steps,
    selectedStep,

    // Loading states
    runLoading,
    stepsLoading,
    runError,
    stepsError,
    canceling,
    running,
    runningFlowId,

    // UI state
    activeTab,
    selectedStepId,
    logQuery,
    cancelable,

    // Actions
    setActiveTab,
    setSelectedStepId,
    setLogQuery,
    refreshAll,
    reloadSteps,
    onCancel,
    onRerun,
    getTone,
    getTabText,
    filterLogText,
    showInfo,
    showSuccess,
    showError,
  };
}

// Helper functions
function pretty(v: unknown) {
  if (v === undefined || v === null) return "";
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return String(v);
  }
}
