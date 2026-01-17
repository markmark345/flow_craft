import { useCallback, useEffect, useState } from "react";
import { useFlowsStore } from "../store/use-flows-store";
import { useAppStore } from "@/hooks/use-app-store";
import { useWorkspaceStore } from "@/features/workspaces/store/use-workspace-store";
import { listPersonalWorkflows, listProjectWorkflows } from "@/features/workflows/services/workflowsApi";

export function useFlowsQuery() {
  const setFlows = useFlowsStore((s) => s.setFlows);
  const showError = useAppStore((s) => s.showError);
  const scope = useWorkspaceStore((s) => s.activeScope);
  const projectId = useWorkspaceStore((s) => s.activeProjectId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      if (scope === "project" && !projectId) {
        setFlows([]);
        return;
      }
      const flows =
        scope === "project" && projectId ? await listProjectWorkflows(projectId) : await listPersonalWorkflows();
      setFlows(flows);
    } catch (err: any) {
      const msg = err?.message || "Failed to load flows";
      setError(msg);
      showError("Load failed", msg);
    } finally {
      setLoading(false);
    }
  }, [projectId, scope, setFlows, showError]);

  useEffect(() => {
    reload();
  }, [reload, scope, projectId]);

  return { loading, error, reload };
}
