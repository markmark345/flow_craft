import { useQuery } from "@tanstack/react-query";
import { useWorkspaceStore } from "@/features/workspaces/store/use-workspace-store";
import { listRuns } from "../services/runsApi";

export function useRunsQuery() {
  const scope = useWorkspaceStore((s) => s.activeScope);
  const projectId = useWorkspaceStore((s) => s.activeProjectId);

  const { data: runs = [], isLoading, error, refetch } = useQuery({
    queryKey: ["runs", scope, projectId],
    queryFn: () => {
      if (scope === "project" && !projectId) return Promise.resolve([]);
      return listRuns({ scope, projectId });
    },
  });

  return { runs, loading: isLoading, error: error?.message, reload: refetch };
}
