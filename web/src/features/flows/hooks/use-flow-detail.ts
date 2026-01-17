"use client";

import { useCallback, useEffect, useState } from "react";
import { getFlow } from "../services/flowsApi";
import { useFlowsStore } from "../store/use-flows-store";
import { useAppStore } from "@/hooks/use-app-store";
import { FlowDTO } from "@/types/dto";

export function useFlowDetailQuery(flowId?: string) {
  const upsertFlow = useFlowsStore((s) => s.upsertFlow);
  const flow = useFlowsStore((s) => (flowId ? s.items.find((f) => f.id === flowId) : undefined));
  const showError = useAppStore((s) => s.showError);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const reload = useCallback(async () => {
    if (!flowId) return;
    setLoading(true);
    setError(undefined);
    try {
      const data = await getFlow(flowId);
      upsertFlow(data);
    } catch (err: any) {
      const msg = err?.message || "Failed to load flow";
      setError(msg);
      showError("Load failed", msg);
    } finally {
      setLoading(false);
    }
  }, [flowId, showError, upsertFlow]);

  useEffect(() => {
    if (!flowId) return;
    if (flow) return;
    void reload();
  }, [flow, flowId, reload]);

  return { flow: flow as FlowDTO | undefined, loading, error, reload };
}

