"use client";

import { useCallback, useState } from "react";
import { runFlow } from "../services/runsApi";
import { useRunsStore } from "../store/use-runs-store";
import { RunDTO } from "@/types/dto";

export function useRunFlow() {
  const upsertRun = useRunsStore((s) => s.upsertRun);
  const [running, setRunning] = useState(false);
  const [runningFlowId, setRunningFlowId] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);

  const startRun = useCallback(
    async (flowId: string): Promise<RunDTO> => {
      setRunning(true);
      setRunningFlowId(flowId);
      setError(undefined);
      try {
        const run = await runFlow(flowId);
        upsertRun(run);
        return run;
      } catch (err: any) {
        const msg = err?.message || "Failed to start run";
        setError(msg);
        throw err;
      } finally {
        setRunning(false);
        setRunningFlowId(undefined);
      }
    },
    [upsertRun]
  );

  return { startRun, running, runningFlowId, error };
}
