import { useEffect, useState } from "react";
import { getFlow } from "@/features/flows/services/flowsApi";
import { useBuilderStore } from "../store/use-builder-store";
import { useAppStore } from "@/shared/hooks/use-app-store";
import { SerializedFlow } from "../types";
import { useWorkspaceStore } from "@/features/workspaces/store/use-workspace-store";

export function useBuilderLoad(flowId?: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const hydrate = useBuilderStore((s) => s.hydrateFromDefinition);
  const setFlowId = useBuilderStore((s) => s.setFlowId);
  const showError = useAppStore((s) => s.showError);
  const setScope = useWorkspaceStore((s) => s.setScope);
  const setActiveProject = useWorkspaceStore((s) => s.setActiveProject);

  useEffect(() => {
    if (!flowId) return;
    const run = async () => {
      setLoading(true);
      setError(undefined);
      try {
        const data = await getFlow(flowId);
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
      } catch (err: any) {
        const msg = err?.message || "Failed to load flow";
        setError(msg);
        showError("Load failed", msg);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [flowId, hydrate, setActiveProject, setFlowId, setScope, showError]);

  return { loading, error };
}
