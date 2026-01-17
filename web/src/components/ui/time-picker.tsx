"use client";

import { useMemo } from "react";
import { cn } from "@/lib/cn";
import { Select, type SelectOption } from "@/components/ui/select";

type Props = {
  hour: number; // 0-23
  minute: number; // 0-59
  onChange: (next: { hour: number; minute: number }) => void;
  className?: string;
  minuteStep?: number;
};

type Period = "AM" | "PM";

function toHour12(hour24: number): { hour12: number; period: Period } {
  const period: Period = hour24 >= 12 ? "PM" : "AM";
  const raw = hour24 % 12;
  const hour12 = raw === 0 ? 12 : raw;
  return { hour12, period };
}

function toHour24(hour12: number, period: Period): number {
  const base = hour12 % 12; // 12 -> 0
  return period === "PM" ? base + 12 : base;
}

function clampInt(v: number, min: number, max: number) {
  if (!Number.isFinite(v)) return min;
  return Math.max(min, Math.min(max, Math.trunc(v)));
}

export function TimePicker({ hour, minute, onChange, className, minuteStep = 1 }: Props) {
  const safeHour = clampInt(hour, 0, 23);
  const safeMinute = clampInt(minute, 0, 59);
  const safeStep = clampInt(minuteStep, 1, 30);

  const { hour12, period } = useMemo(() => toHour12(safeHour), [safeHour]);

  const hourOptions = useMemo<SelectOption[]>(
    () =>
      Array.from({ length: 12 }, (_, i) => {
        const value = i + 1;
        return { value, label: String(value).padStart(2, "0") };
      }),
    []
  );

  const minuteOptions = useMemo<SelectOption[]>(
    () =>
      Array.from({ length: Math.ceil(60 / safeStep) }, (_, i) => {
        const value = i * safeStep;
        return { value, label: String(value).padStart(2, "0") };
      }),
    [safeStep]
  );

  const periodOptions = useMemo<SelectOption[]>(
    () => [
      { value: "AM", label: "AM" },
      { value: "PM", label: "PM" },
    ],
    []
  );

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="w-[76px]">
        <Select
          value={hour12}
          options={hourOptions}
          onChange={(v) => {
            const nextHour12 = clampInt(Number(v), 1, 12);
            onChange({ hour: toHour24(nextHour12, period), minute: safeMinute });
          }}
        />
      </div>
      <div className="w-[76px]">
        <Select
          value={safeMinute}
          options={minuteOptions}
          onChange={(v) => onChange({ hour: safeHour, minute: clampInt(Number(v), 0, 59) })}
          searchable={safeStep !== 1}
          searchPlaceholder="Search minutes..."
        />
      </div>
      <div className="w-[84px]">
        <Select
          value={period}
          options={periodOptions}
          onChange={(v) => {
            const nextPeriod = v === "PM" ? "PM" : "AM";
            onChange({ hour: toHour24(hour12, nextPeriod), minute: safeMinute });
          }}
        />
      </div>
    </div>
  );
}

