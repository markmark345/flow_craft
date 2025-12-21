import { useState, useCallback } from "react";
import { useFlowsStore } from "../store/use-flows-store";
import { FlowDTO } from "@/shared/types/dto";
import { createFlow as apiCreateFlow } from "../services/flowsApi";

type UseCreateFlowResult = {
  createFlow: (name: string) => Promise<FlowDTO>;
  loading: boolean;
  error?: string;
};

export function useCreateFlow(): UseCreateFlowResult {
  const addFlow = useFlowsStore((s) => s.addFlow);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const createFlow = useCallback(
    async (name: string) => {
      setLoading(true);
      setError(undefined);
      try {
        const flow = await apiCreateFlow({
          name,
          status: "draft",
          version: 1,
          definitionJson: JSON.stringify({
            id: "",
            name,
            version: 1,
            reactflow: { nodes: [], edges: [], viewport: { x: 0, y: 0, zoom: 1 } },
            notes: [],
          }),
        });
        addFlow(flow);
        return flow;
      } catch (err: any) {
        setError(err?.message || "Failed to create flow");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [addFlow]
  );

  return { createFlow, loading, error };
}
