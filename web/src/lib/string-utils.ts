/**
 * String utility functions
 * Provides common string manipulation and formatting operations
 */

/**
 * Truncate ID to short format
 * @param id - Full ID string
 * @returns Shortened ID (e.g., "12345678…abcd") or original if ≤12 chars
 */
export function shortId(id: string): string {
  if (id.length <= 12) return id;
  return `${id.slice(0, 8)}…${id.slice(-4)}`;
}

/**
 * Convert value to pretty-printed JSON string
 * @param v - Value to stringify
 * @returns Formatted JSON string or empty string if null/undefined
 */
export function pretty(v: unknown): string {
  if (v === undefined || v === null) return "";
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return String(v);
  }
}

/**
 * Infer username from email address
 * @param email - Email address
 * @returns Username (part before @) or empty string if invalid
 */
export function inferUsername(email: string): string {
  const trimmed = email.trim().toLowerCase();
  const at = trimmed.indexOf("@");
  if (at <= 0) return "";
  return trimmed.slice(0, at);
}

/**
 * Convert unknown value to string
 * @param value - Value to convert
 * @returns String representation of value
 */
export function toStringValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}
