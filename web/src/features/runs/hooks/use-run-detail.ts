"use client";
import { useQuery } from "@tanstack/react-query";
import { getRun } from "../services/runsApi";
import { RunDTO } from "@/types/dto";

export function useRunDetailQuery(runId?: string) {
  const { data: run, isLoading, error, refetch } = useQuery({
    queryKey: ["run", runId],
    queryFn: () => getRun(runId!),
    enabled: !!runId,
  });

  return { run: run as RunDTO | undefined, loading: isLoading, error: error?.message, reload: refetch };
}
