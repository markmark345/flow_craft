
import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useFlowsQuery } from "./use-flows";
import { useFlowActions } from "./use-flow-actions";
import { useRunsQuery } from "@/features/runs/hooks/use-runs";
import { useRunFlow } from "@/features/runs/hooks/use-run-flow";
import { runMeta, runSortTime } from "../lib/flow-utils";
import { RunDTO } from "@/types/dto";

import { useFlowsFilters } from "./use-flows-filters";
import { useFlowsPagination } from "./use-flows-pagination";
import { useFlowsSelection } from "./use-flows-selection";
import { useFlowsUI } from "./use-flows-ui";

export interface UseFlowsPageReturn {
  // Loading states and Actions from useFlowsUI, useFlowsFilters, etc.
  // We can infer the return type or explicitly define it based on the composed object.
  // For backward compatibility, we can keep the interface or export a new one.
  // Since the original file exported this interface, it's safer to keep it or let typescript infer if possible.
  // But typescript inference is better. Let's return the composed object and let consumers infer, 
  // OR explicitly match the previous return type if it's strictly used.
  // Given the complexity, let's just return the object and let TS infer, unless there are explicit type imports used elsewhere.
  // The original file exported `UseFlowsPageReturn`. I'll try to match it structurally.
}

/**
 * Custom hook for managing Flows Page state and logic.
 * Handles flow listing, filtering, pagination, selection, and actions.
 */
export function useFlowsPage() {
  const router = useRouter();

  // Data queries
  const { flows, loading: flowsLoading, error: flowsError, reload: reloadFlows } = useFlowsQuery();
  const { runs, loading: runsLoading, reload: reloadRuns } = useRunsQuery();

  // Flow actions
  const {
    importFlowFromFile,
    importing,
    duplicateExistingFlow,
    duplicatingId,
    archiveExistingFlow,
    archivingId,
    deleteExistingFlow,
    deletingId,
  } = useFlowActions();
  const { startRun, running, runningFlowId } = useRunFlow();

  // Composed Hooks
  const filters = useFlowsFilters(flows);
  const pagination = useFlowsPagination(filters.filtered);
  const selection = useFlowsSelection(pagination.pageItems);
  const ui = useFlowsUI(archivingId, deletingId);

  // Sync pagination reset when filters change
  useEffect(() => {
    pagination.resetPage();
  }, [filters.query, filters.status, filters.owner, pagination.pageSize]);

  // Actions
  const onImportFile = async (file: File) => {
    const { flow } = await importFlowFromFile(file);
    router.push(`/flows/${flow.id}/builder`);
  };

  const onReload = () => {
    reloadFlows();
    reloadRuns();
  };

  const onRunFlow = async (flowId: string) => {
    try {
      const run = await startRun(flowId);
      ui.showSuccess("Run started", run.id.slice(0, 8));
      router.push(`/runs/${run.id}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unable to start run";
      ui.showError("Run failed", errorMessage);
    }
  };

  const onConfirm = async () => {
    if (!ui.confirm) return;
    try {
      if (ui.confirm.type === "archive") await archiveExistingFlow(ui.confirm.flow);
      if (ui.confirm.type === "delete") await deleteExistingFlow(ui.confirm.flow);
      ui.setConfirm(null);
    } catch {
      // toasts handled by hooks
    }
  };

  const onCreatePersonal = () => router.push("/flows/new?scope=personal");
  const onCreateProject = () => {
    if (!ui.activeProjectId) return;
    router.push(`/flows/new?scope=project&projectId=${encodeURIComponent(ui.activeProjectId)}`);
  };

  // Last run by flow ID (Compute here or extract if complex, but this is data derivation)
  const lastRunByFlowId = useMemo(() => {
    const map = new Map<string, RunDTO>();
    for (const run of runs) {
      const t = runSortTime(run);
      const existing = map.get(run.flowId);
      if (!existing || t > runSortTime(existing)) map.set(run.flowId, run);
    }
    return map;
  }, [runs]);

  const runMetaForFlow = (flowId: string) => runMeta(lastRunByFlowId.get(flowId));

  return {
    flowsLoading,
    runsLoading,
    flowsError,
    importing,
    duplicatingId,
    archivingId,
    deletingId,
    running,
    runningFlowId,

    flows,
    
    // Spread hooks
    ...filters,
    ...pagination,
    ...selection,
    ...ui,

    // Actions
    onImportFile,
    onReload,
    onRunFlow,
    runMetaForFlow,
    onConfirm,
    onCreatePersonal,
    onCreateProject,
  };
}
