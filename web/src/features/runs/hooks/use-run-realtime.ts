"use client";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useWebSocket } from "@/hooks/use-websocket";

type RunUpdatePayload = {
  runId: string;
  status?: string;
};

/**
 * useRunRealtime — subscribes to run_update WebSocket events for the given
 * runId and invalidates React Query caches for run detail and run steps.
 *
 * Drives real-time log updates (useRunDetailQuery) and node status colors
 * (useRunStepsQuery) in the builder canvas.
 *
 * The backend sends run_update on two occasions:
 *   1. Run status change: { runId, status: "running" | "success" | "failed" }
 *   2. Step update:       { runId, status: "" }   (step fields changed)
 * Both invalidate the same queries so the UI stays in sync.
 */
export function useRunRealtime(runId?: string) {
  const queryClient = useQueryClient();
  const { subscribe } = useWebSocket();

  useEffect(() => {
    if (!runId) return;

    const unsub = subscribe("run_update", (payload) => {
      const event = payload as RunUpdatePayload;
      if (event.runId !== runId) return;

      void queryClient.invalidateQueries({ queryKey: ["run", runId] });
      void queryClient.invalidateQueries({ queryKey: ["run-steps", runId] });
    });

    return unsub;
  }, [runId, queryClient, subscribe]);
}
