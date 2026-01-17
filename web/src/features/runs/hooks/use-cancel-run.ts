"use client";

import { useCallback, useState } from "react";
import { cancelRun } from "../services/runsApi";
import { useRunsStore } from "../store/use-runs-store";
import { useAppStore } from "@/hooks/use-app-store";

export function useCancelRun() {
  const upsertRun = useRunsStore((s) => s.upsertRun);
  const showSuccess = useAppStore((s) => s.showSuccess);
  const showError = useAppStore((s) => s.showError);
  const [canceling, setCanceling] = useState(false);

  const cancel = useCallback(
    async (runId: string) => {
      setCanceling(true);
      try {
        const run = await cancelRun(runId);
        upsertRun(run);
        showSuccess("Run canceled");
        return run;
      } catch (err: any) {
        showError("Cancel failed", err?.message || "Unable to cancel run");
        throw err;
      } finally {
        setCanceling(false);
      }
    },
    [showError, showSuccess, upsertRun]
  );

  return { cancel, canceling };
}

