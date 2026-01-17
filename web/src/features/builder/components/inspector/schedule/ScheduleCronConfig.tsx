"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type ScheduleState } from "../../../lib/schedule-utils";

interface ScheduleCronConfigProps {
  state: ScheduleState;
  onApply: (patch: Partial<ScheduleState>) => void;
}

export function ScheduleCronConfig({ state, onApply }: ScheduleCronConfigProps) {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-bold text-muted">Cron expression</Label>
      <Input
        value={state.cron}
        onChange={(e) => onApply({ cron: e.target.value })}
        placeholder="0 * * * *"
        className="h-10 rounded-lg bg-surface2 font-mono"
      />
      <div className="text-[11px] text-muted">Format: minute hour day month weekday</div>
    </div>
  );
}
