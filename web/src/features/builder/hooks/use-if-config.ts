import { useMemo } from "react";
import type { IfCondition, IfConditionType, IfNodeConfig } from "../components/if-config";

export interface UseIfConfigReturn {
  state: IfNodeConfig;
  updateCondition: (id: string, patch: Partial<IfCondition>) => void;
  removeCondition: (id: string) => void;
  addCondition: () => void;
}

/**
 * Custom hook for managing if-config component state.
 * Handles condition CRUD operations and state coercion.
 */
export function useIfConfig(
  config: Record<string, unknown>,
  onPatch: (patch: Record<string, unknown>) => void,
  coerceIfConfig: (config: Record<string, unknown>) => IfNodeConfig
): UseIfConfigReturn {
  const state = useMemo(() => coerceIfConfig(config), [config, coerceIfConfig]);

  const updateCondition = (id: string, patch: Partial<IfCondition>) => {
    const next = state.conditions.map((c) => (c.id === id ? { ...c, ...patch } : c));
    onPatch({ conditions: next });
  };

  const removeCondition = (id: string) => {
    const next = state.conditions.filter((c) => c.id !== id);
    onPatch({
      conditions: next.length
        ? next
        : [{ id: crypto.randomUUID(), type: "string", operator: "is equal to", left: "", right: "" }],
    });
  };

  const addCondition = () => {
    onPatch({
      conditions: [
        ...state.conditions,
        { id: crypto.randomUUID(), type: "string", operator: "is equal to", left: "", right: "" },
      ],
    });
  };

  return {
    state,
    updateCondition,
    removeCondition,
    addCondition,
  };
}
