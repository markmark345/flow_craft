"use client";

import { useEffect, useState } from "react";

import { Input } from "@/shared/components/input";
import { Select, type SelectOption } from "@/shared/components/select";

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

  const timeValue = `${String(state.hour).padStart(2, "0")}:${String(state.minute).padStart(2, "0")}`;

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

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <label className="block text-xs font-bold text-muted">Schedule</label>
        <Select
          value={state.mode}
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
          onChange={(next) => apply({ mode: next as ScheduleMode })}
        />
      </div>

      {state.mode === "every" ? (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-muted">Every (minutes)</label>
            <Input
              type="number"
              min={1}
              max={59}
              value={String(state.everyMinutes)}
              onChange={(e) => apply({ everyMinutes: clampInt(Number(e.target.value), 1, 59) })}
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
      ) : null}

      {state.mode === "hourly" ? (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-muted">At minute</label>
            <Input
              type="number"
              min={0}
              max={59}
              value={String(state.minute)}
              onChange={(e) => apply({ minute: clampInt(Number(e.target.value), 0, 59) })}
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
      ) : null}

      {state.mode === "daily" || state.mode === "weekly" || state.mode === "monthly" ? (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-muted">At time</label>
            <Input
              type="time"
              value={timeValue}
              onChange={(e) => {
                const [h, m] = parseTimeHHMM(e.target.value);
                apply({ hour: h, minute: m });
              }}
              className="h-10 rounded-lg bg-surface2 font-mono"
            />
          </div>

          {state.mode === "monthly" ? (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-muted">Day of month</label>
              <Input
                type="number"
                min={1}
                max={31}
                value={String(state.dayOfMonth)}
                onChange={(e) => apply({ dayOfMonth: clampInt(Number(e.target.value), 1, 31) })}
                className="h-10 rounded-lg bg-surface2 font-mono"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-muted">Preview</label>
              <div className="h-10 rounded-lg bg-surface2 border border-border px-3 flex items-center text-xs font-mono text-muted">
                {scheduleStateToExpression(state)}
              </div>
            </div>
          )}
        </div>
      ) : null}

      {state.mode === "weekly" ? (
        <div className="space-y-2">
          <label className="block text-xs font-bold text-muted">Days</label>
          <div className="flex flex-wrap gap-2">
            {dayLabels.map((d) => {
              const active = state.days.includes(d.id);
              return (
                <button
                  key={d.id}
                  type="button"
                  className={`px-2.5 py-1 rounded-lg border text-xs font-semibold transition-colors ${
                    active ? "bg-accent text-white border-accent" : "bg-surface2 text-muted border-border hover:bg-surface"
                  }`}
                  onClick={() => toggleDay(d.id)}
                >
                  {d.label}
                </button>
              );
            })}
          </div>
          <div className="text-[11px] text-muted font-mono">{scheduleStateToExpression(state)}</div>
        </div>
      ) : null}

      {state.mode === "monthly" ? (
        <div className="space-y-2">
          <div className="text-xs font-bold uppercase tracking-wide text-muted">Preview</div>
          <div className="text-[11px] text-muted font-mono">{scheduleStateToExpression(state)}</div>
        </div>
      ) : null}

      {state.mode === "cron" ? (
        <div className="space-y-2">
          <label className="block text-xs font-bold text-muted">Cron expression</label>
          <Input
            value={state.cron}
            onChange={(e) => apply({ cron: e.target.value })}
            placeholder="0 * * * *"
            className="h-10 rounded-lg bg-surface2 font-mono"
          />
          <div className="text-[11px] text-muted">Format: minute hour day month weekday</div>
        </div>
      ) : null}
    </div>
  );
}

function clampInt(v: number, min: number, max: number) {
  if (!Number.isFinite(v)) return min;
  return Math.max(min, Math.min(max, Math.trunc(v)));
}

function parseTimeHHMM(v: string): [number, number] {
  const [hRaw, mRaw] = v.split(":");
  const h = clampInt(Number(hRaw), 0, 23);
  const m = clampInt(Number(mRaw), 0, 59);
  return [h, m];
}

function parseScheduleExpression(expression: string): ScheduleState {
  const raw = String(expression || "").trim();
  if (!raw) {
    return {
      mode: "hourly",
      everyMinutes: 5,
      minute: 0,
      hour: 0,
      days: [1],
      dayOfMonth: 1,
      cron: "",
    };
  }

  const parts = raw.split(/\s+/).filter(Boolean);
  const p = parts.length === 6 ? parts.slice(1) : parts;
  if (p.length !== 5) {
    return {
      mode: "cron",
      everyMinutes: 5,
      minute: 0,
      hour: 0,
      days: [1],
      dayOfMonth: 1,
      cron: raw,
    };
  }

  const [minPart, hourPart, domPart, monPart, dowPart] = p;
  const base: ScheduleState = {
    mode: "cron",
    everyMinutes: 5,
    minute: 0,
    hour: 0,
    days: [1],
    dayOfMonth: 1,
    cron: raw,
  };

  if (monPart !== "*") return base;

  if (minPart === "*" && hourPart === "*" && domPart === "*" && dowPart === "*") {
    return { ...base, mode: "every", everyMinutes: 1 };
  }

  const everyMatch = minPart.match(/^\*\/(\d{1,2})$/);
  if (everyMatch && hourPart === "*" && domPart === "*" && dowPart === "*") {
    return { ...base, mode: "every", everyMinutes: clampInt(Number(everyMatch[1]), 1, 59) };
  }

  const minNum = toInt(minPart);
  const hourNum = toInt(hourPart);
  const domNum = toInt(domPart);

  if (minNum != null && hourPart === "*" && domPart === "*" && dowPart === "*") {
    return { ...base, mode: "hourly", minute: clampInt(minNum, 0, 59) };
  }

  if (minNum != null && hourNum != null && domPart === "*" && dowPart === "*") {
    return {
      ...base,
      mode: "daily",
      minute: clampInt(minNum, 0, 59),
      hour: clampInt(hourNum, 0, 23),
    };
  }

  if (minNum != null && hourNum != null && domPart === "*" && dowPart !== "*") {
    const days = parseDowList(dowPart);
    return {
      ...base,
      mode: "weekly",
      minute: clampInt(minNum, 0, 59),
      hour: clampInt(hourNum, 0, 23),
      days: days.length ? days : [1],
    };
  }

  if (minNum != null && hourNum != null && domNum != null && dowPart === "*") {
    return {
      ...base,
      mode: "monthly",
      minute: clampInt(minNum, 0, 59),
      hour: clampInt(hourNum, 0, 23),
      dayOfMonth: clampInt(domNum, 1, 31),
    };
  }

  return base;
}

function toInt(v: string) {
  if (!/^\d+$/.test(v)) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function parseDowList(v: string): number[] {
  const parts = v.split(",").map((p) => p.trim()).filter(Boolean);
  const out: number[] = [];
  for (const p of parts) {
    const n = toInt(p);
    if (n == null) continue;
    out.push(clampInt(n, 0, 6));
  }
  const unique = Array.from(new Set(out));
  unique.sort((a, b) => a - b);
  return unique;
}

function scheduleStateToExpression(state: ScheduleState): string {
  const minute = clampInt(state.minute, 0, 59);
  const hour = clampInt(state.hour, 0, 23);
  const dom = clampInt(state.dayOfMonth, 1, 31);

  switch (state.mode) {
    case "every": {
      const n = clampInt(state.everyMinutes, 1, 59);
      if (n === 1) return "* * * * *";
      return `*/${n} * * * *`;
    }
    case "hourly":
      return `${minute} * * * *`;
    case "daily":
      return `${minute} ${hour} * * *`;
    case "weekly": {
      const days = (state.days || []).map((d) => clampInt(d, 0, 6));
      const unique = Array.from(new Set(days)).sort((a, b) => a - b);
      const dow = unique.length ? unique.join(",") : "1";
      return `${minute} ${hour} * * ${dow}`;
    }
    case "monthly":
      return `${minute} ${hour} ${dom} * *`;
    case "cron":
    default:
      return String(state.cron || "").trim();
  }
}
