"use client";
import { useQuery } from "@tanstack/react-query";
import { listRunSteps } from "../services/runsApi";

export function useRunStepsQuery(runId?: string) {
  const { data: steps = [], isLoading, error, refetch } = useQuery({
    queryKey: ["run-steps", runId],
    queryFn: () => listRunSteps(runId!),
    enabled: !!runId,
    // Poll every 2 s as fallback when WS events are missed
    refetchInterval: runId ? 2000 : false,
  });

  return { steps, loading: isLoading, error: error?.message, reload: refetch };
}
