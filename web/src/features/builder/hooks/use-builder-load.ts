import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getFlow } from "@/features/flows/services/flowsApi";
import { useBuilderStore } from "../store/use-builder-store";
import { SerializedFlow } from "../types";
import { useWorkspaceStore } from "@/features/workspaces/store/use-workspace-store";

export function useBuilderLoad(flowId?: string) {
  const hydrate = useBuilderStore((s) => s.hydrateFromDefinition);
  const setFlowId = useBuilderStore((s) => s.setFlowId);
  const setScope = useWorkspaceStore((s) => s.setScope);
  const setActiveProject = useWorkspaceStore((s) => s.setActiveProject);

  const { data, isLoading, error } = useQuery({
    queryKey: ["flow", flowId],
    queryFn: () => getFlow(flowId!),
    enabled: !!flowId,
  });

  useEffect(() => {
    if (!data || !flowId) return;
    if (data.scope === "project" && data.projectId) {
      setActiveProject(data.projectId);
    } else {
      setScope("personal");
    }
    setFlowId(flowId);
    let def: SerializedFlow | undefined;
    if (data.definitionJson) {
      try {
        def = JSON.parse(data.definitionJson) as SerializedFlow;
      } catch {
        def = undefined;
      }
    }
    if (!def) {
      def = {
        id: flowId,
        name: data.name,
        version: 1,
        reactflow: { nodes: [], edges: [], viewport: { x: 0, y: 0, zoom: 1 } },
        notes: [],
      };
    }
    hydrate(def, data.name);
  }, [data, flowId, hydrate, setActiveProject, setFlowId, setScope]);

  return { loading: isLoading, error: error?.message };
}
