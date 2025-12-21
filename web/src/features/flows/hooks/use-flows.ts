import { useCallback, useEffect, useState } from "react";
import { useFlowsStore } from "../store/use-flows-store";
import { listFlows } from "../services/flowsApi";
import { useAppStore } from "@/shared/hooks/use-app-store";

export function useFlowsQuery() {
  const setFlows = useFlowsStore((s) => s.setFlows);
  const showError = useAppStore((s) => s.showError);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      const flows = await listFlows();
      setFlows(flows);
    } catch (err: any) {
      const msg = err?.message || "Failed to load flows";
      setError(msg);
      showError("Load failed", msg);
    } finally {
      setLoading(false);
    }
  }, [setFlows, showError]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { loading, error, reload };
}
