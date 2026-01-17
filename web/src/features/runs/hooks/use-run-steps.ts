"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { listRunSteps } from "../services/runsApi";
import { useRunStepsStore } from "../store/use-run-steps-store";
import { useAppStore } from "@/hooks/use-app-store";

type Options = { pollMs?: number };

export function useRunStepsQuery(runId?: string, options: Options = {}) {
  const steps = useRunStepsStore((s) => (runId ? s.stepsByRunId[runId] : undefined)) || [];
  const setSteps = useRunStepsStore((s) => s.setSteps);
  const showError = useAppStore((s) => s.showError);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const reload = useCallback(async () => {
    if (!runId) return;
    setLoading(true);
    setError(undefined);
    try {
      const data = await listRunSteps(runId);
      setSteps(runId, data);
    } catch (err: any) {
      const msg = err?.message || "Failed to load steps";
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

  useEffect(() => {
    if (!runId) return;
    if (!options.pollMs) return;
    if (!isActive) return;

    const id = window.setInterval(() => {
      void reload();
    }, options.pollMs);

    return () => window.clearInterval(id);
  }, [isActive, options.pollMs, reload, runId]);

  return { steps, loading, error, reload };
}

