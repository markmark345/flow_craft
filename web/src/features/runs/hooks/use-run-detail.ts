"use client";
import { getErrorMessage } from "@/lib/error-utils";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getRun } from "../services/runsApi";
import { useRunsStore } from "../store/use-runs-store";
import { useAppStore } from "@/hooks/use-app-store";
import { RunDTO } from "@/types/dto";

type Options = { pollMs?: number };

export function useRunDetailQuery(runId?: string, options: Options = {}) {
  const upsertRun = useRunsStore((s) => s.upsertRun);
  const run = useRunsStore((s) => (runId ? s.items.find((r) => r.id === runId) : undefined));
  const showError = useAppStore((s) => s.showError);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const reload = useCallback(async () => {
    if (!runId) return;
    setLoading(true);
    setError(undefined);
    try {
      const data = await getRun(runId);
      upsertRun(data);
    } catch (err: unknown) {
      const msg = getErrorMessage(err) || "Failed to load run";
      setError(msg);
      showError("Load failed", msg);
    } finally {
      setLoading(false);
    }
  }, [runId, showError, upsertRun]);

  useEffect(() => {
    if (!runId) return;
    void reload();
  }, [reload, runId]);

  const isActive = useMemo(() => {
    if (!run) return true;
    return run.status === "queued" || run.status === "running";
  }, [run]);

  useEffect(() => {
    if (!runId) return;
    if (!options.pollMs) return;
    if (!isActive) return;

    const id = window.setInterval(() => {
      void reload();
    }, options.pollMs);

    return () => window.clearInterval(id);
  }, [isActive, options.pollMs, reload, runId]);

  return { run: run as RunDTO | undefined, loading, error, reload };
}

