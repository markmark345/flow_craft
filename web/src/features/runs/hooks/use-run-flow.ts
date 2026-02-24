"use client";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { runFlow } from "../services/runsApi";
import { RunDTO } from "@/types/dto";

export function useRunFlow() {
  const queryClient = useQueryClient();
  const [runningFlowId, setRunningFlowId] = useState<string | undefined>(undefined);

  const { mutateAsync, isPending: running } = useMutation({
    mutationFn: (flowId: string) => runFlow(flowId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["runs"] }),
  });

  const startRun = async (flowId: string): Promise<RunDTO> => {
    setRunningFlowId(flowId);
    try {
      return await mutateAsync(flowId);
    } finally {
      setRunningFlowId(undefined);
    }
  };

  return { startRun, running, runningFlowId };
}
