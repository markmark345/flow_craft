"use client";
import { getErrorMessage } from "@/lib/error-utils";

import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { resetWorkspace as apiResetWorkspace } from "@/services/systemApi";
import { useAppStore } from "@/hooks/use-app-store";

export function useResetWorkspace() {
  const queryClient = useQueryClient();
  const showSuccess = useAppStore((s) => s.showSuccess);
  const showError = useAppStore((s) => s.showError);
  const [resetting, setResetting] = useState(false);

  const resetWorkspace = useCallback(async () => {
    setResetting(true);
    try {
      await apiResetWorkspace();
      queryClient.invalidateQueries({ queryKey: ["flows"] });
      queryClient.invalidateQueries({ queryKey: ["runs"] });
      showSuccess("Workspace reset", "All flows and runs were removed.");
    } catch (err: unknown) {
      showError("Reset failed", getErrorMessage(err) || "Unable to reset workspace");
      throw err;
    } finally {
      setResetting(false);
    }
  }, [queryClient, showError, showSuccess]);

  return { resetWorkspace, resetting };
}
