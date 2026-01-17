import { useCallback, useEffect, useState } from "react";
import { useRunsStore } from "../store/use-runs-store";
import { listRuns } from "../services/runsApi";
import { useAppStore } from "@/hooks/use-app-store";
import { useWorkspaceStore } from "@/features/workspaces/store/use-workspace-store";

export function useRunsQuery() {
  const setRuns = useRunsStore((s) => s.setRuns);
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
        setRuns([]);
        return;
      }
      const runs = await listRuns({ scope, projectId });
      setRuns(runs);
    } catch (err: any) {
      const msg = err?.message || "Failed to load runs";
      setError(msg);
      showError("Load failed", msg);
    } finally {
      setLoading(false);
    }
  }, [projectId, scope, setRuns, showError]);

  useEffect(() => {
    reload();
  }, [reload, scope, projectId]);

  return { loading, error, reload };
}
