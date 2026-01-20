import { useState, useCallback } from "react";
import { getErrorMessage } from "@/lib/error-utils";
import { useFlowsStore } from "../store/use-flows-store";
import { FlowDTO } from "@/types/dto";
import { createWorkflow } from "@/features/workflows/services/workflowsApi";
import { useWorkspaceStore, type WorkspaceScope } from "@/features/workspaces/store/use-workspace-store";

type UseCreateFlowResult = {
  createFlow: (name: string, opts?: { scope?: WorkspaceScope; projectId?: string | null }) => Promise<FlowDTO>;
  loading: boolean;
  error?: string;
};

export function useCreateFlow(): UseCreateFlowResult {
  const addFlow = useFlowsStore((s) => s.addFlow);
  const scope = useWorkspaceStore((s) => s.activeScope);
  const projectId = useWorkspaceStore((s) => s.activeProjectId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const createFlow = useCallback(
    async (name: string, opts?: { scope?: WorkspaceScope; projectId?: string | null }) => {
      setLoading(true);
      setError(undefined);
      try {
        const definitionJson = JSON.stringify({
          id: "",
          name,
          version: 1,
          reactflow: { nodes: [], edges: [], viewport: { x: 0, y: 0, zoom: 1 } },
          notes: [],
        });
        const targetScope = opts?.scope || scope;
        const targetProjectId = opts?.projectId ?? projectId;

        const flow =
          targetScope === "project" && targetProjectId
            ? await createWorkflow({
                name,
                scope: "project",
                projectId: targetProjectId,
                status: "draft",
                version: 1,
                definitionJson,
              })
            : await createWorkflow({
                name,
                scope: "personal",
                status: "draft",
                version: 1,
                definitionJson,
              });
        addFlow(flow);
        return flow;
      } catch (err: unknown) {
        setError(getErrorMessage(err) || "Failed to create flow");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [addFlow, projectId, scope]
  );

  return { createFlow, loading, error };
}
