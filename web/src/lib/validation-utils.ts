/**
 * Validation utility functions
 * Provides common validation operations for form data and configuration
 */

/**
 * Check if a value is configured (not empty/null/undefined)
 * @param value - Value to check
 * @returns True if value is considered configured
 */
export function isConfiguredValue(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "number") return Number.isFinite(value);
  if (typeof value === "boolean") return true;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.keys(value as any).length > 0;
  return false;
}
