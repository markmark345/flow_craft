"use client";

import { Input } from "@/components/ui/input";
import { clampInt } from "@/lib/number-utils";
import { type ScheduleState, scheduleStateToExpression } from "../../../lib/schedule-utils";

interface ScheduleHourlyConfigProps {
  state: ScheduleState;
  onApply: (patch: Partial<ScheduleState>) => void;
}

export function ScheduleHourlyConfig({ state, onApply }: ScheduleHourlyConfigProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-2">
        <label className="block text-xs font-bold text-muted">At minute</label>
        <Input
          type="number"
          min={0}
          max={59}
          value={String(state.minute)}
          onChange={(e) => onApply({ minute: clampInt(Number(e.target.value), 0, 59) })}
          className="h-10 rounded-lg bg-surface2 font-mono"
        />
      </div>
      <div className="space-y-2">
        <label className="block text-xs font-bold text-muted">Preview</label>
        <div className="h-10 rounded-lg bg-surface2 border border-border px-3 flex items-center text-xs font-mono text-muted">
          {scheduleStateToExpression(state)}
        </div>
      </div>
    </div>
  );
}
