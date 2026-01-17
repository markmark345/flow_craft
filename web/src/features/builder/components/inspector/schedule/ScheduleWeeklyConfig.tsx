"use client";

import { Button } from "@/components/ui/button";
import { TimePicker } from "@/components/ui/time-picker";
import { type ScheduleState, scheduleStateToExpression } from "../../../lib/schedule-utils";

interface ScheduleWeeklyConfigProps {
  state: ScheduleState;
  onApply: (patch: Partial<ScheduleState>) => void;
}

export function ScheduleWeeklyConfig({ state, onApply }: ScheduleWeeklyConfigProps) {
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
    onApply({ days: nextDays.length ? nextDays : [1] });
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="block text-xs font-bold text-muted">At time</label>
          <TimePicker
            hour={state.hour}
            minute={state.minute}
            onChange={({ hour, minute }) => onApply({ hour, minute })}
          />
        </div>
        <div className="space-y-2">
          <label className="block text-xs font-bold text-muted">Preview</label>
          <div className="h-10 rounded-lg bg-surface2 border border-border px-3 flex items-center text-xs font-mono text-muted">
            {scheduleStateToExpression(state)}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-bold text-muted">Days</label>
        <div className="flex flex-wrap gap-2">
          {dayLabels.map((d) => {
            const active = state.days.includes(d.id);
            return (
              <Button
                key={d.id}
                variant="ghost"
                className={`px-2.5 py-1 h-auto rounded-lg border text-xs font-semibold transition-colors ${
                  active
                    ? "bg-accent text-white border-accent hover:bg-accent/90"
                    : "bg-surface2 text-muted border-border hover:bg-surface"
                }`}
                onClick={() => toggleDay(d.id)}
              >
                {d.label}
              </Button>
            );
          })}
        </div>
        <div className="text-[11px] text-muted font-mono">{scheduleStateToExpression(state)}</div>
      </div>
    </div>
  );
}
