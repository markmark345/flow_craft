import { useCallback, useEffect, useState } from "react";
import { useRunsStore } from "../store/use-runs-store";
import { listRuns } from "../services/runsApi";
import { useAppStore } from "@/shared/hooks/use-app-store";

export function useRunsQuery() {
  const setRuns = useRunsStore((s) => s.setRuns);
  const showError = useAppStore((s) => s.showError);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      const runs = await listRuns();
      setRuns(runs);
    } catch (err: any) {
      const msg = err?.message || "Failed to load runs";
      setError(msg);
      showError("Load failed", msg);
    } finally {
      setLoading(false);
    }
  }, [setRuns, showError]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { loading, error, reload };
}
