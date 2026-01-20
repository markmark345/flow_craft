import { getErrorMessage } from "@/lib/error-utils";
/**
 * Authentication utility functions
 * Provides utilities for auth error handling and formatting
 */

/**
 * Convert error to inline error message for signup/login forms
 * @param err - Error object
 * @returns User-friendly error message
 */
export function toInlineMessage(err: unknown): string {
  const raw = String(getErrorMessage(err) || "").trim();
  if (!raw) return "Sign up failed.";
  if (raw.toLowerCase().includes("already")) return "This email/username is already in use.";
  return raw;
}
