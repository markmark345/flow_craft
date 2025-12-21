import { useEffect, useState } from "react";
import { getFlow } from "@/features/flows/services/flowsApi";
import { useBuilderStore } from "../store/use-builder-store";
import { useAppStore } from "@/shared/hooks/use-app-store";
import { SerializedFlow } from "../types";

export function useBuilderLoad(flowId?: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const hydrate = useBuilderStore((s) => s.hydrateFromDefinition);
  const setFlowId = useBuilderStore((s) => s.setFlowId);
  const markSaved = useBuilderStore((s) => s.markSaved);
  const showError = useAppStore((s) => s.showError);

  useEffect(() => {
    if (!flowId) return;
    const run = async () => {
      setLoading(true);
      setError(undefined);
		try {
			const data = await getFlow(flowId);
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
			markSaved();
		} catch (err: any) {
        const msg = err?.message || "Failed to load flow";
        setError(msg);
        showError("Load failed", msg);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [flowId, hydrate, markSaved, setFlowId, showError]);

  return { loading, error };
}
