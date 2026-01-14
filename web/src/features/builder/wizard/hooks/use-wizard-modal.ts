import { useMemo } from "react";

type StepDef = { key: string; title: string };

export interface UseWizardModalReturn {
  steps: StepDef[];
  isLast: boolean;
  confirmLabel: string;
}

/**
 * Custom hook for managing wizard modal steps and navigation.
 * Returns step definitions, navigation state, and confirm label based on mode.
 */
export function useWizardModal(
  mode: string,
  stepIndex: number
): UseWizardModalReturn {
  const steps = useMemo<StepDef[]>(() => {
    if (mode === "add-agent") {
      return [
        { key: "agent", title: "Agent" },
        { key: "model", title: "Model" },
        { key: "memory", title: "Memory" },
        { key: "tools", title: "Tools" },
        { key: "review", title: "Review" },
      ];
    }
    if (mode === "add-agent-tool") {
      return [
        { key: "tool", title: "Tool" },
        { key: "credential", title: "Credential" },
        { key: "configure", title: "Configure" },
        { key: "test", title: "Test" },
        { key: "review", title: "Review" },
      ];
    }
    return [
      { key: "app", title: "App" },
      { key: "action", title: "Action" },
      { key: "credential", title: "Credential" },
      { key: "configure", title: "Configure" },
      { key: "test", title: "Test" },
      { key: "review", title: "Review" },
    ];
  }, [mode]);

  const isLast = stepIndex >= steps.length - 1;
  const confirmLabel = mode === "add-agent-tool" ? "Add tool" : "Add node";

  return {
    steps,
    isLast,
    confirmLabel,
  };
}
