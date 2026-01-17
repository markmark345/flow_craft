"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TimePicker } from "@/components/ui/time-picker";
import { clampInt } from "@/lib/number-utils";
import { type ScheduleState, scheduleStateToExpression } from "../../../lib/schedule-utils";

interface ScheduleMonthlyConfigProps {
  state: ScheduleState;
  onApply: (patch: Partial<ScheduleState>) => void;
}

export function ScheduleMonthlyConfig({ state, onApply }: ScheduleMonthlyConfigProps) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label className="text-xs font-bold text-muted">At time</Label>
          <TimePicker
            hour={state.hour}
            minute={state.minute}
            onChange={({ hour, minute }) => onApply({ hour, minute })}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-bold text-muted">Day of month</Label>
          <Input
            type="number"
            min={1}
            max={31}
            value={String(state.dayOfMonth)}
            onChange={(e) => onApply({ dayOfMonth: clampInt(Number(e.target.value), 1, 31) })}
            className="h-10 rounded-lg bg-surface2 font-mono"
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-xs font-bold uppercase tracking-wide text-muted">Preview</div>
        <div className="text-[11px] text-muted font-mono">{scheduleStateToExpression(state)}</div>
      </div>
    </div>
  );
}
