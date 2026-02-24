"use client";
import { getErrorMessage } from "@/lib/error-utils";

import { useCallback, useEffect, useMemo, useState } from "react";
import { listRunSteps } from "../services/runsApi";
import { useRunStepsStore } from "../store/use-run-steps-store";
import { useAppStore } from "@/hooks/use-app-store";
import { useWebSocket } from "@/hooks/use-websocket";

type Options = { pollMs?: number; enableWebSocket?: boolean };

export function useRunStepsQuery(runId?: string, options: Options = {}) {
  const steps = useRunStepsStore((s) => (runId ? s.stepsByRunId[runId] : undefined)) || [];
  const setSteps = useRunStepsStore((s) => s.setSteps);
  const showError = useAppStore((s) => s.showError);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const { subscribe } = useWebSocket();

  const reload = useCallback(async () => {
    if (!runId) return;
    setLoading(true); // Maybe avoid setting loading true on background refresh?
    setError(undefined);
    try {
      const data = await listRunSteps(runId);
      setSteps(runId, data);
    } catch (err: unknown) {
      const msg = getErrorMessage(err) || "Failed to load steps";
      setError(msg);
      showError("Load failed", msg);
    } finally {
      setLoading(false);
    }
  }, [runId, setSteps, showError]);

  useEffect(() => {
    if (!runId) return;
    void reload();
  }, [reload, runId]);

  const isActive = useMemo(() => {
    if (!steps.length) return true;
    return steps.some((s) => s.status === "queued" || s.status === "running");
  }, [steps]);

  // Polling (Legacy/Fallback)
  useEffect(() => {
    if (!runId) return;
    if (!options.pollMs) return;
    if (!isActive) return;
    // Actually best to disable polling if WS is requested.
    if (options.enableWebSocket) return;

    const id = window.setInterval(() => {
      void reload();
    }, options.pollMs);

    return () => window.clearInterval(id);
  }, [isActive, options.pollMs, options.enableWebSocket, reload, runId]);

  // WebSocket Subscription
  useEffect(() => {
    if (!runId || !options.enableWebSocket) return;

    const unsubscribe = subscribe("run_update", (payload: any) => {
        if (payload.runId === runId) {
            void reload();
        }
    });

    return () => unsubscribe();
  }, [runId, options.enableWebSocket, subscribe, reload]);

  return { steps, loading, error, reload };
}
