/**
 * Number utility functions
 * Provides common number operations and validations
 */

/**
 * Clamp integer value between min and max
 * @param v - Value to clamp
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Clamped integer value
 */
export function clampInt(v: number, min: number, max: number): number {
  if (!Number.isFinite(v)) return min;
  return Math.max(min, Math.min(max, Math.trunc(v)));
}

/**
 * Safely parse string to integer
 * @param v - String to parse
 * @returns Parsed integer or null if invalid
 */
export function toInt(v: string): number | null {
  if (!/^\d+$/.test(v)) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
