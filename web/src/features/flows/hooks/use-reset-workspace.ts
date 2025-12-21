"use client";

import { useCallback, useState } from "react";
import { resetWorkspace as apiResetWorkspace } from "@/shared/services/systemApi";
import { useFlowsStore } from "../store/use-flows-store";
import { useRunsStore } from "@/features/runs/store/use-runs-store";
import { useAppStore } from "@/shared/hooks/use-app-store";

export function useResetWorkspace() {
  const setFlows = useFlowsStore((s) => s.setFlows);
  const setRuns = useRunsStore((s) => s.setRuns);
  const showSuccess = useAppStore((s) => s.showSuccess);
  const showError = useAppStore((s) => s.showError);
  const [resetting, setResetting] = useState(false);

  const resetWorkspace = useCallback(async () => {
    setResetting(true);
    try {
      await apiResetWorkspace();
      setRuns([]);
      setFlows([]);
      showSuccess("Workspace reset", "All flows and runs were removed.");
    } catch (err: any) {
      showError("Reset failed", err?.message || "Unable to reset workspace");
      throw err;
    } finally {
      setResetting(false);
    }
  }, [setFlows, setRuns, showError, showSuccess]);

  return { resetWorkspace, resetting };
}

