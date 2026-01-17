"use client";

import { TimePicker } from "@/components/ui/time-picker";
import { Label } from "@/components/ui/label";
import { type ScheduleState, scheduleStateToExpression } from "../../../lib/schedule-utils";

interface ScheduleDailyConfigProps {
  state: ScheduleState;
  onApply: (patch: Partial<ScheduleState>) => void;
}

export function ScheduleDailyConfig({ state, onApply }: ScheduleDailyConfigProps) {
  return (
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
        <Label className="text-xs font-bold text-muted">Preview</Label>
        <div className="h-10 rounded-lg bg-surface2 border border-border px-3 flex items-center text-xs font-mono text-muted">
          {scheduleStateToExpression(state)}
        </div>
      </div>
    </div>
  );
}
