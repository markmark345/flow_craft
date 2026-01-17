"use client";

import { Select, type SelectOption } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { type ScheduleMode } from "../../../lib/schedule-utils";

interface ScheduleModeSelectProps {
  mode: ScheduleMode;
  onChange: (mode: ScheduleMode) => void;
}

export function ScheduleModeSelect({ mode, onChange }: ScheduleModeSelectProps) {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-bold text-muted">Schedule</Label>
      <Select
        value={mode}
        options={
          [
            { value: "every", label: "Every N minutes" },
            { value: "hourly", label: "Hourly" },
            { value: "daily", label: "Daily" },
            { value: "weekly", label: "Weekly" },
            { value: "monthly", label: "Monthly" },
            { value: "cron", label: "Cron (advanced)" },
          ] satisfies SelectOption[]
        }
        onChange={(next) => onChange(next as ScheduleMode)}
      />
    </div>
  );
}
