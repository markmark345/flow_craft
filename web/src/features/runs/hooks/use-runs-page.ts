
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useRunsStore } from "../store/use-runs-store";
import { useRunsQuery } from "./use-runs";
import { useRunFlow } from "./use-run-flow";
import { useAppStore } from "@/hooks/use-app-store";
import { useFlowsQuery } from "@/features/flows/hooks/use-flows";
import { useFlowsStore } from "@/features/flows/store/use-flows-store";
import type { RunDTO } from "@/types/dto";

import { useRunsFilters } from "./use-runs-filters";
import { useRunsPagination } from "./use-runs-pagination";

/**
 * Custom hook for managing Runs Page state and logic.
 * Handles run listing, filtering, pagination, and auto-refresh.
 */
export function useRunsPage() {
  const router = useRouter();

  // Data queries
  const { loading: runsLoading, error: runsError, reload: reloadRuns } = useRunsQuery();
  const { loading: flowsLoading, reload: reloadFlows } = useFlowsQuery();
  const runs = useRunsStore((s) => s.items);
  const flows = useFlowsStore((s) => s.items);
  const { startRun, running, runningFlowId } = useRunFlow();

  // UI messages
  const showSuccess = useAppStore((s) => s.showSuccess);
  const showInfo = useAppStore((s) => s.showInfo);

  // Sub-hooks
  const filters = useRunsFilters(runs, flows);
  const pagination = useRunsPagination(filters.filtered);

  // Local state - auto refresh
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return;
    const id = window.setInterval(() => {
      void reloadRuns();
    }, 5000);
    return () => window.clearInterval(id);
  }, [autoRefresh, reloadRuns]);

  // Reset page when filters change
  useEffect(() => {
    pagination.resetPage();
  }, [filters.query, filters.status, filters.timeframe, filters.flowId, pagination.pageSize]);

  // Flow name lookup
  const flowsById = useMemo(() => new Map(flows.map((f) => [f.id, f.name])), [flows]);

  // Actions
  const refreshAll = async () => {
    await Promise.all([reloadRuns(), reloadFlows()]);
  };

  const exportLogs = () => {
    try {
      const filename = `flowcraft-runs-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.json`;
      const blob = new Blob([JSON.stringify(filters.filtered, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      showSuccess("Exported", `Downloaded ${filters.filtered.length} executions.`);
    } catch {
      showInfo("Export", "Unable to export logs in this environment.");
    }
  };

  const startRunForFlow = async (flowIdToRun: string) => {
    const created = await startRun(flowIdToRun);
    showSuccess("Run started", "Redirecting to run detail…");
    router.push(`/runs/${created.id}`);
  };

  const navigateToRun = (runId: string) => {
    router.push(`/runs/${runId}`);
  };

  const getTone = (s: RunDTO["status"]) => {
    if (s === "success") return "success" as const;
    if (s === "failed") return "danger" as const;
    if (s === "running") return "warning" as const;
    if (s === "canceled") return "default" as const;
    return "default" as const;
  };

  return {
    runsLoading,
    flowsLoading,
    runsError,
    running,
    runningFlowId,

    runs,
    flows,
    flowsById,
    autoRefresh,
    setAutoRefresh,

    // Spread sub-hooks
    ...filters,
    ...pagination,

    // Actions
    refreshAll,
    exportLogs,
    startRunForFlow,
    navigateToRun,
    getTone,
  };
}
