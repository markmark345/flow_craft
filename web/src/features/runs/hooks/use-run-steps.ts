"use client";
import { useQuery } from "@tanstack/react-query";
import { listRunSteps } from "../services/runsApi";

export function useRunStepsQuery(runId?: string) {
  const { data: steps = [], isLoading, error, refetch } = useQuery({
    queryKey: ["run-steps", runId],
    queryFn: () => listRunSteps(runId!),
    enabled: !!runId,
  });

  return { steps, loading: isLoading, error: error?.message, reload: refetch };
}
