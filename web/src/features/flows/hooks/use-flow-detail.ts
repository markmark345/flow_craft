"use client";
import { useQuery } from "@tanstack/react-query";
import { getFlow } from "../services/flowsApi";
import { FlowDTO } from "@/types/dto";

export function useFlowDetailQuery(flowId?: string) {
  const { data: flow, isLoading, error, refetch } = useQuery({
    queryKey: ["flow", flowId],
    queryFn: () => getFlow(flowId!),
    enabled: !!flowId,
  });

  return { flow: flow as (FlowDTO & { definitionJson?: string }) | undefined, loading: isLoading, error: error?.message, reload: refetch };
}
