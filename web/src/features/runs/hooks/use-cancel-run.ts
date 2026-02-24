"use client";
import { getErrorMessage } from "@/lib/error-utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cancelRun } from "../services/runsApi";
import { useAppStore } from "@/hooks/use-app-store";

export function useCancelRun() {
  const queryClient = useQueryClient();
  const showSuccess = useAppStore((s) => s.showSuccess);
  const showError = useAppStore((s) => s.showError);

  const { mutateAsync: cancel, isPending: canceling } = useMutation({
    mutationFn: (runId: string) => cancelRun(runId),
    onSuccess: (run) => {
      queryClient.invalidateQueries({ queryKey: ["run", run.id] });
      queryClient.invalidateQueries({ queryKey: ["runs"] });
      showSuccess("Run canceled");
    },
    onError: (err) => showError("Cancel failed", getErrorMessage(err) || "Unable to cancel run"),
  });

  return { cancel, canceling };
}
