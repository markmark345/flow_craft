import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useFlowsQuery } from "@/features/flows/hooks/use-flows";
import { useFlowsStore } from "@/features/flows/store/use-flows-store";
import { useRunsQuery } from "@/features/runs/hooks/use-runs";
import { useRunsStore } from "@/features/runs/store/use-runs-store";
import { useAppStore } from "@/hooks/use-app-store";
import type { FlowDTO, RunDTO } from "@/types/dto";

import { useQuery } from "@tanstack/react-query";
import { getStats } from "@/features/runs/services/runsApi";

export interface UseDashboardPageReturn {
  // Data
  flows: FlowDTO[];
  runs: RunDTO[];
  recentFlows: FlowDTO[];
  recentRuns: RunDTO[];
  stats: import("@/types/dto").RunStatsDTO | null;
  isLoadingStats: boolean;

  // Actions
  showInfo: ReturnType<typeof useAppStore.getState>["showInfo"];
  navigateToFlow: (flowId: string) => void;
}

/**
 * Custom hook for managing Dashboard Page state and logic.
 * Handles recent flows and runs display with navigation.
 */
export function useDashboardPage(): UseDashboardPageReturn {
  const router = useRouter();

  // Data queries
  useFlowsQuery();
  useRunsQuery();
  const flows = useFlowsStore((s) => s.items);
  const runs = useRunsStore((s) => s.items);

  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["runs", "stats"],
    queryFn: getStats,
  });

  // UI messages
  const showInfo = useAppStore((s) => s.showInfo);

  // Computed values
  const recentFlows = useMemo(
    () => [...flows].sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || "")).slice(0, 5),
    [flows]
  );

  const recentRuns = useMemo(
    () => [...runs].sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || "")).slice(0, 6),
    [runs]
  );

  // Actions
  const navigateToFlow = (flowId: string) => {
    router.push(`/flows/${flowId}/builder`);
  };

  return {
    // Data
    flows,
    runs,
    recentFlows,
    recentRuns,
    stats: stats || null,
    isLoadingStats,

    // Actions
    showInfo,
    navigateToFlow,
  };
}
