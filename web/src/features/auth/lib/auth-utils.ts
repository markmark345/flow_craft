/**
 * Authentication utility functions
 * Provides utilities for auth error handling and formatting
 */

/**
 * Convert error to inline error message for signup/login forms
 * @param err - Error object
 * @returns User-friendly error message
 */
export function toInlineMessage(err: any): string {
  const raw = String(err?.message || "").trim();
  if (!raw) return "Sign up failed.";
  if (raw.toLowerCase().includes("already")) return "This email/username is already in use.";
  return raw;
}
