/**
 * Chat model configuration utilities
 * Provides utilities for AI model provider configuration and defaults
 */

export type Provider = "openai" | "gemini" | "grok";

/**
 * Normalize provider string to valid Provider type
 * @param value - Provider value to normalize
 * @returns Valid Provider type
 */
export function normalizeProvider(value: unknown): Provider {
  const v = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (v === "gemini" || v === "grok" || v === "openai") return v;
  return "openai";
}

/**
 * Get default configuration for a provider
 * @param provider - Provider type
 * @returns Default model and baseUrl for the provider
 */
export function getProviderDefaults(provider: Provider): { model: string; baseUrl: string } {
  switch (provider) {
    case "gemini":
      return { model: "gemini-1.5-flash", baseUrl: "https://generativelanguage.googleapis.com" };
    case "grok":
      return { model: "grok-2-latest", baseUrl: "https://api.x.ai/v1" };
    case "openai":
    default:
      return { model: "gpt-4o-mini", baseUrl: "https://api.openai.com/v1" };
  }
}
