import { useEffect, useState } from "react";

type ScheduleMode = "every" | "hourly" | "daily" | "weekly" | "monthly" | "cron";

type ScheduleState = {
  mode: ScheduleMode;
  everyMinutes: number;
  minute: number;
  hour: number;
  days: number[];
  dayOfMonth: number;
  cron: string;
};

export interface UseInspectorScheduleConfigReturn {
  state: ScheduleState;
  apply: (patch: Partial<ScheduleState>) => void;
  toggleDay: (day: number) => void;
  dayLabels: Array<{ id: number; label: string }>;
}

/**
 * Custom hook for managing schedule config state.
 * Handles schedule expression parsing, state updates, and day toggling.
 */
export function useInspectorScheduleConfig(
  config: Record<string, unknown>,
  onPatch: (patch: Record<string, unknown>) => void,
  parseScheduleExpression: (expr: string) => ScheduleState,
  scheduleStateToExpression: (state: ScheduleState) => string
): UseInspectorScheduleConfigReturn {
  const expr = typeof config.expression === "string" ? config.expression : "";
  const [state, setState] = useState<ScheduleState>(() => parseScheduleExpression(expr));

  useEffect(() => {
    setState(parseScheduleExpression(expr));
  }, [expr, parseScheduleExpression]);

  const apply = (patch: Partial<ScheduleState>) => {
    const next = { ...state, ...patch };
    const nextExpr = scheduleStateToExpression(next);
    setState(next);
    onPatch({ expression: nextExpr });
  };

  const dayLabels: Array<{ id: number; label: string }> = [
    { id: 1, label: "Mon" },
    { id: 2, label: "Tue" },
    { id: 3, label: "Wed" },
    { id: 4, label: "Thu" },
    { id: 5, label: "Fri" },
    { id: 6, label: "Sat" },
    { id: 0, label: "Sun" },
  ];

  const toggleDay = (day: number) => {
    const set = new Set(state.days);
    if (set.has(day)) set.delete(day);
    else set.add(day);
    const nextDays = Array.from(set);
    nextDays.sort((a, b) => a - b);
    apply({ days: nextDays.length ? nextDays : [1] });
  };

  return {
    state,
    apply,
    toggleDay,
    dayLabels,
  };
}
