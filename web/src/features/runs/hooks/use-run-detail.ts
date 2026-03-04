"use client";
import { useQuery } from "@tanstack/react-query";
import { getRun } from "../services/runsApi";
import { RunDTO } from "@/types/dto";

export function useRunDetailQuery(runId?: string) {
  const { data: run, isLoading, error, refetch } = useQuery({
    queryKey: ["run", runId],
    queryFn: () => getRun(runId!),
    enabled: !!runId,
    // Poll every 2 s while run is active; stop once it reaches a terminal state
    refetchInterval: (query) => {
      const r = query.state.data as RunDTO | undefined;
      if (!r) return runId ? 2000 : false;
      return r.status === "running" || r.status === "queued" ? 2000 : false;
    },
  });

  return { run: run as RunDTO | undefined, loading: isLoading, error: error?.message, reload: refetch };
}
