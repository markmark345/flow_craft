import { useQuery } from "@tanstack/react-query";
import { useWorkspaceStore } from "@/features/workspaces/store/use-workspace-store";
import { listPersonalWorkflows, listProjectWorkflows } from "@/features/workflows/services/workflowsApi";

export function useFlowsQuery() {
  const scope = useWorkspaceStore((s) => s.activeScope);
  const projectId = useWorkspaceStore((s) => s.activeProjectId);

  const { data: flows = [], isLoading, error, refetch } = useQuery({
    queryKey: ["flows", scope, projectId],
    queryFn: () => {
      if (scope === "project" && !projectId) return Promise.resolve([]);
      return scope === "project" && projectId
        ? listProjectWorkflows(projectId)
        : listPersonalWorkflows();
    },
  });

  return { flows, loading: isLoading, error: error?.message, reload: refetch };
}
