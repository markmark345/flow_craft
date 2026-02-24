import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getErrorMessage } from "@/lib/error-utils";
import { FlowDTO } from "@/types/dto";
import { createWorkflow } from "@/features/workflows/services/workflowsApi";
import { useWorkspaceStore, type WorkspaceScope } from "@/features/workspaces/store/use-workspace-store";

type UseCreateFlowResult = {
  createFlow: (name: string, opts?: { scope?: WorkspaceScope; projectId?: string | null }) => Promise<FlowDTO>;
  loading: boolean;
  error?: string;
};

export function useCreateFlow(): UseCreateFlowResult {
  const queryClient = useQueryClient();
  const scope = useWorkspaceStore((s) => s.activeScope);
  const projectId = useWorkspaceStore((s) => s.activeProjectId);

  const { mutateAsync, isPending: loading, error: mutationError } = useMutation({
    mutationFn: (params: Parameters<typeof createWorkflow>[0]) => createWorkflow(params),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["flows"] }),
  });

  const createFlow = useCallback(
    async (name: string, opts?: { scope?: WorkspaceScope; projectId?: string | null }): Promise<FlowDTO> => {
      const definitionJson = JSON.stringify({
        id: "",
        name,
        version: 1,
        reactflow: { nodes: [], edges: [], viewport: { x: 0, y: 0, zoom: 1 } },
        notes: [],
      });
      const targetScope = opts?.scope || scope;
      const targetProjectId = opts?.projectId ?? projectId;

      if (targetScope === "project" && targetProjectId) {
        return mutateAsync({ name, scope: "project", projectId: targetProjectId, status: "draft", version: 1, definitionJson });
      }
      return mutateAsync({ name, scope: "personal", status: "draft", version: 1, definitionJson });
    },
    [mutateAsync, projectId, scope]
  );

  return { createFlow, loading, error: mutationError ? (getErrorMessage(mutationError) || "Failed to create flow") : undefined };
}
