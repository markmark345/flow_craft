"use client";

import { Input } from "@/components/ui/input";
import { clampInt } from "@/lib/number-utils";
import { type ScheduleState, scheduleStateToExpression } from "../../../lib/schedule-utils";

interface ScheduleEveryConfigProps {
  state: ScheduleState;
  onApply: (patch: Partial<ScheduleState>) => void;
}

export function ScheduleEveryConfig({ state, onApply }: ScheduleEveryConfigProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-2">
        <label className="block text-xs font-bold text-muted">Every (minutes)</label>
        <Input
          type="number"
          min={1}
          max={59}
          value={String(state.everyMinutes)}
          onChange={(e) => onApply({ everyMinutes: clampInt(Number(e.target.value), 1, 59) })}
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
