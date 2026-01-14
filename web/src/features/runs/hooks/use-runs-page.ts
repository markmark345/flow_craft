import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useRunsStore } from "../store/use-runs-store";
import { useRunsQuery } from "./use-runs";
import { useRunFlow } from "./use-run-flow";
import { useAppStore } from "@/shared/hooks/use-app-store";
import { useFlowsQuery } from "@/features/flows/hooks/use-flows";
import { useFlowsStore } from "@/features/flows/store/use-flows-store";
import type { RunDTO } from "@/shared/types/dto";

export interface UseRunsPageReturn {
  // Loading states
  runsLoading: boolean;
  flowsLoading: boolean;
  runsError: Error | null;
  running: boolean;
  runningFlowId: string | null;

  // Data
  runs: RunDTO[];
  flows: ReturnType<typeof useFlowsStore.getState>["items"];
  filtered: RunDTO[];
  pageItems: RunDTO[];
  flowsById: Map<string, string>;

  // Filters
  query: string;
  status: "all" | RunDTO["status"];
  timeframe: "24h" | "7d" | "30d" | "all";
  flowId: string;
  autoRefresh: boolean;

  // Pagination
  page: number;
  pageSize: number;
  pageCount: number;
  pageSafe: number;
  pageStartIdx: number;

  // Actions
  setQuery: (query: string) => void;
  setStatus: (status: "all" | RunDTO["status"]) => void;
  setTimeframe: (timeframe: "24h" | "7d" | "30d" | "all") => void;
  setFlowId: (flowId: string) => void;
  setPageSize: (size: number) => void;
  setPage: (page: number) => void;
  setAutoRefresh: (enabled: boolean) => void;
  refreshAll: () => Promise<void>;
  exportLogs: () => void;
  startRunForFlow: (flowId: string) => Promise<void>;
  navigateToRun: (runId: string) => void;
  getTone: (status: RunDTO["status"]) => "success" | "danger" | "warning" | "default";
}

/**
 * Custom hook for managing Runs Page state and logic.
 * Handles run listing, filtering, pagination, and auto-refresh.
 */
export function useRunsPage(): UseRunsPageReturn {
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

  // Local state - filters
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | RunDTO["status"]>("all");
  const [timeframe, setTimeframe] = useState<"24h" | "7d" | "30d" | "all">("24h");
  const [flowId, setFlowId] = useState<string>("all");
  const [pageSize, setPageSize] = useState(20);
  const [page, setPage] = useState(1);
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return;
    const id = window.setInterval(() => {
      void reloadRuns();
    }, 5000);
    return () => window.clearInterval(id);
  }, [autoRefresh, reloadRuns]);

  // Filtered and sorted runs
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const cutoff = cutoffFor(timeframe);
    const flowsById = new Map(flows.map((f) => [f.id, f]));

    return runs
      .filter((r) => (status === "all" ? true : r.status === status))
      .filter((r) => (flowId === "all" ? true : r.flowId === flowId))
      .filter((r) => {
        if (!cutoff) return true;
        const t = parseTime(r.createdAt || r.startedAt);
        return t ? t >= cutoff : true;
      })
      .filter((r) => {
        if (!q) return true;
        const name = flowsById.get(r.flowId)?.name || "";
        return (
          r.id.toLowerCase().includes(q) ||
          r.flowId.toLowerCase().includes(q) ||
          name.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => (b.createdAt || b.startedAt || "").localeCompare(a.createdAt || a.startedAt || ""));
  }, [flows, flowId, query, runs, status, timeframe]);

  // Reset page when filters change
  useEffect(() => setPage(1), [query, status, timeframe, flowId, pageSize]);

  // Pagination
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageSafe = Math.min(page, pageCount);
  const pageStartIdx = (pageSafe - 1) * pageSize;
  const pageItems = filtered.slice(pageStartIdx, pageStartIdx + pageSize);

  // Flow name lookup
  const flowsById = useMemo(() => new Map(flows.map((f) => [f.id, f.name])), [flows]);

  // Actions
  const refreshAll = async () => {
    await Promise.all([reloadRuns(), reloadFlows()]);
  };

  const exportLogs = () => {
    try {
      const filename = `flowcraft-runs-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.json`;
      const blob = new Blob([JSON.stringify(filtered, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      showSuccess("Exported", `Downloaded ${filtered.length} executions.`);
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
    // Loading states
    runsLoading,
    flowsLoading,
    runsError,
    running,
    runningFlowId,

    // Data
    runs,
    flows,
    filtered,
    pageItems,
    flowsById,

    // Filters
    query,
    status,
    timeframe,
    flowId,
    autoRefresh,

    // Pagination
    page,
    pageSize,
    pageCount,
    pageSafe,
    pageStartIdx,

    // Actions
    setQuery,
    setStatus,
    setTimeframe,
    setFlowId,
    setPageSize,
    setPage,
    setAutoRefresh,
    refreshAll,
    exportLogs,
    startRunForFlow,
    navigateToRun,
    getTone,
  };
}

// Helper functions
function parseTime(v?: string) {
  if (!v) return undefined;
  const t = new Date(v).getTime();
  return Number.isFinite(t) ? t : undefined;
}

function cutoffFor(tf: "24h" | "7d" | "30d" | "all") {
  const now = Date.now();
  if (tf === "all") return undefined;
  if (tf === "24h") return now - 24 * 60 * 60 * 1000;
  if (tf === "7d") return now - 7 * 24 * 60 * 60 * 1000;
  return now - 30 * 24 * 60 * 60 * 1000;
}
