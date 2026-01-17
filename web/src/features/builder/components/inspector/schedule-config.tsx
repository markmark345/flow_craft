"use client";

import { useEffect, useState } from "react";

import {
  type ScheduleMode,
  type ScheduleState,
  parseScheduleExpression,
  scheduleStateToExpression,
} from "../../lib/schedule-utils";
import { ScheduleModeSelect } from "./schedule/ScheduleModeSelect";
import { ScheduleEveryConfig } from "./schedule/ScheduleEveryConfig";
import { ScheduleHourlyConfig } from "./schedule/ScheduleHourlyConfig";
import { ScheduleDailyConfig } from "./schedule/ScheduleDailyConfig";
import { ScheduleWeeklyConfig } from "./schedule/ScheduleWeeklyConfig";
import { ScheduleMonthlyConfig } from "./schedule/ScheduleMonthlyConfig";
import { ScheduleCronConfig } from "./schedule/ScheduleCronConfig";

export function ScheduleConfig({
  config,
  onPatch,
}: {
  config: Record<string, unknown>;
  onPatch: (patch: Record<string, unknown>) => void;
}) {
  const expr = typeof config.expression === "string" ? config.expression : "";
  const [state, setState] = useState<ScheduleState>(() => parseScheduleExpression(expr));

  useEffect(() => {
    setState(parseScheduleExpression(expr));
  }, [expr]);

  const apply = (patch: Partial<ScheduleState>) => {
    const next = { ...state, ...patch };
    const nextExpr = scheduleStateToExpression(next);
    setState(next);
    onPatch({ expression: nextExpr });
  };

  const handleModeChange = (mode: ScheduleMode) => {
    apply({ mode });
  };

  return (
    <div className="space-y-5">
      <ScheduleModeSelect mode={state.mode} onChange={handleModeChange} />

      {state.mode === "every" ? (
        <ScheduleEveryConfig state={state} onApply={apply} />
      ) : null}

      {state.mode === "hourly" ? (
        <ScheduleHourlyConfig state={state} onApply={apply} />
      ) : null}

      {state.mode === "daily" ? (
        <ScheduleDailyConfig state={state} onApply={apply} />
      ) : null}

      {state.mode === "weekly" ? (
        <ScheduleWeeklyConfig state={state} onApply={apply} />
      ) : null}

      {state.mode === "monthly" ? (
        <ScheduleMonthlyConfig state={state} onApply={apply} />
      ) : null}

      {state.mode === "cron" ? (
        <ScheduleCronConfig state={state} onApply={apply} />
      ) : null}
    </div>
  );
}
