/**
 * Schedule/Cron configuration utilities
 * Provides utilities for parsing and generating cron expressions
 */

import { clampInt, toInt } from "@/lib/number-utils";

export type ScheduleMode = "every" | "hourly" | "daily" | "weekly" | "monthly" | "cron";

export type ScheduleState = {
  mode: ScheduleMode;
  everyMinutes: number;
  minute: number;
  hour: number;
  days: number[];
  dayOfMonth: number;
  cron: string;
};

/**
 * Parse cron expression to schedule state
 * @param expression - Cron expression string
 * @returns Parsed schedule state
 */
export function parseScheduleExpression(expression: string): ScheduleState {
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

/**
 * Parse day of week list from cron expression
 * @param v - Day of week string (e.g., "1,3,5")
 * @returns Array of day numbers (0-6)
 */
export function parseDowList(v: string): number[] {
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

/**
 * Convert schedule state to cron expression
 * @param state - Schedule state
 * @returns Cron expression string
 */
export function scheduleStateToExpression(state: ScheduleState): string {
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
