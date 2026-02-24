"use client";
import { getErrorMessage } from "@/lib/error-utils";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getRun } from "../services/runsApi";
import { useRunsStore } from "../store/use-runs-store";
import { useAppStore } from "@/hooks/use-app-store";
import { RunDTO } from "@/types/dto";
import { useWebSocket } from "@/hooks/use-websocket";

type Options = { pollMs?: number; enableWebSocket?: boolean };

export function useRunDetailQuery(runId?: string, options: Options = {}) {
  const upsertRun = useRunsStore((s) => s.upsertRun);
  const run = useRunsStore((s) => (runId ? s.items.find((r) => r.id === runId) : undefined));
  const showError = useAppStore((s) => s.showError);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const { subscribe } = useWebSocket();

  const reload = useCallback(async () => {
    if (!runId) return;
    if (!useRunsStore.getState().items.find((r) => r.id === runId)) setLoading(true);
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

    // Disable polling if WS is enabled
    if (options.enableWebSocket) return;

    const id = window.setInterval(() => {
      void reload();
    }, options.pollMs);

    return () => window.clearInterval(id);
  }, [isActive, options.pollMs, options.enableWebSocket, reload, runId]);

  // WebSocket Subscription
  useEffect(() => {
    if (!runId || !options.enableWebSocket) return;

    const unsubscribe = subscribe("run_update", (payload) => {
        const event = payload as import("@/hooks/use-websocket").RunUpdateEvent;
        if (event.runId === runId) {
            void reload();
        }
    });

    return () => unsubscribe();
  }, [runId, options.enableWebSocket, subscribe, reload]);

  return { run: run as RunDTO | undefined, loading, error, reload };
}
