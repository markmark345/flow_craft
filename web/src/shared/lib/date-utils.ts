/**
 * Date and time utility functions
 * Provides common date/time formatting and parsing operations
 */

/**
 * Parse ISO string to timestamp
 * @param v - ISO date string
 * @returns Unix timestamp in milliseconds, or undefined if invalid
 */
export function parseTime(v?: string): number | undefined {
  if (!v) return undefined;
  const t = new Date(v).getTime();
  return Number.isFinite(t) ? t : undefined;
}

/**
 * Format ISO date string to human-readable format
 * @param iso - ISO date string
 * @returns Formatted date string (e.g., "Jan 15, 2:30 PM") or "—" if invalid
 */
export function formatDate(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return "—";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
}

/**
 * Format date for display with full year
 * @param value - ISO date string
 * @returns Formatted date string (e.g., "Jan 15, 2024") or "—" if invalid
 */
export function formatDateWithYear(value?: string): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

/**
 * Format date to relative time string
 * @param iso - ISO date string
 * @returns Relative time string (e.g., "2 mins ago", "Just now") or "—" if invalid
 */
export function formatRelative(iso?: string): string {
  const t = parseTime(iso);
  if (!t) return "—";
  const diff = Date.now() - t;
  if (diff < 60_000) return "Just now";
  if (diff < 60 * 60_000) return `${Math.floor(diff / 60_000)} mins ago`;
  if (diff < 24 * 60 * 60_000) return `${Math.floor(diff / (60 * 60_000))} hours ago`;
  return `${Math.floor(diff / (24 * 60 * 60_000))} days ago`;
}

/**
 * Calculate and format duration between two timestamps
 * @param startedAt - Start time ISO string
 * @param finishedAt - End time ISO string
 * @returns Formatted duration (e.g., "1.5s", "2m 30s") or "—" if invalid
 */
export function formatDuration(startedAt?: string, finishedAt?: string): string {
  const start = parseTime(startedAt);
  const end = parseTime(finishedAt);
  if (!start || !end) return "—";
  const ms = Math.max(0, end - start);
  if (ms < 1000) return `${ms}ms`;
  const sec = ms / 1000;
  if (sec < 10) return `${sec.toFixed(1)}s`;
  if (sec < 60) return `${Math.round(sec)}s`;
  const min = Math.floor(sec / 60);
  const rem = Math.round(sec % 60);
  return `${min}m ${rem}s`;
}

/**
 * Calculate cutoff timestamp for timeframe filter
 * @param tf - Timeframe ("24h", "7d", "30d", "all")
 * @returns Cutoff timestamp in milliseconds, or undefined for "all"
 */
export function cutoffFor(tf: "24h" | "7d" | "30d" | "all"): number | undefined {
  const now = Date.now();
  if (tf === "all") return undefined;
  if (tf === "24h") return now - 24 * 60 * 60 * 1000;
  if (tf === "7d") return now - 7 * 24 * 60 * 60 * 1000;
  return now - 30 * 24 * 60 * 60 * 1000;
}
