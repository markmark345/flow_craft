/**
 * Flow node utilities
 * Provides utilities for node configuration validation and label extraction
 */

import { APP_CATALOG, findAppAction, normalizeAppKey } from "../nodeCatalog/catalog";
import { isConfiguredValue } from "@/lib/validation-utils";

/**
 * Extract app label from node config
 * @param config - Node configuration
 * @returns App label or empty string
 */
export function appLabelFromConfig(config: Record<string, unknown>): string {
  const key = normalizeAppKey(config.app);
  if (!key) return typeof config.app === "string" ? config.app : "";
  return APP_CATALOG[key]?.label || "";
}

/**
 * Extract action label from node config
 * @param config - Node configuration
 * @returns Action label or empty string
 */
export function actionLabelFromConfig(config: Record<string, unknown>): string {
  const key = normalizeAppKey(config.app);
  if (!key) return "";
  const actionKey = typeof config.action === "string" ? config.action.trim() : "";
  if (!actionKey) return "";
  return findAppAction(key, actionKey)?.label || "";
}

/**
 * Check if app action is fully configured
 * @param config - Node configuration
 * @returns True if all required fields are configured
 */
export function isAppActionConfigured(config: Record<string, unknown>): boolean {
  const key = normalizeAppKey(config.app);
  if (!key) return false;
  const def = APP_CATALOG[key];
  const actionKey = typeof config.action === "string" ? config.action.trim() : "";
  if (!actionKey) return false;
  const action = findAppAction(key, actionKey);
  if (!action) return false;
  const schema: Array<{ key: string; label: string; required?: boolean }> = [
    ...(def?.baseFields || []),
    ...(action?.fields || []),
  ];

  const errors: string[] = [];
  for (const field of schema) {
    if (!field.required) continue;
    if (!isConfiguredValue(config[field.key])) errors.push(field.key);
  }

  if (key === "bannerbear") {
    const credentialId = typeof config.credentialId === "string" ? config.credentialId.trim() : "";
    const apiKey = typeof (config as any).apiKey === "string" ? String((config as any).apiKey).trim() : "";
    if (!credentialId && !apiKey) errors.push("credentialId");
  }

  return errors.length === 0;
}

/**
 * Get node accent color based on app key or default accent
 */
export function getNodeAccent(
  nodeType: string,
  appKey: string,
  baseAccentColor: string
): string {
  if (nodeType !== "app") return baseAccentColor;
  
  if (appKey === "googlesheets" || appKey === "gsheets") return "var(--success)";
  if (appKey === "gmail") return "var(--error)";
  if (appKey === "bannerbear" || appKey === "bananabear") return "var(--warning)";
  if (appKey === "github") return "var(--accent)";
  
  return baseAccentColor;
}

/**
 * Map node type to specific icon type for rendering
 */
export function getNodeIconType(nodeType: string, appKey: string): string {
  if (nodeType !== "app") return nodeType;
  
  if (appKey === "googlesheets" || appKey === "gsheets" || appKey === "googlesheet") return "googleSheets";
  if (appKey === "gmail") return "gmail";
  if (appKey === "github") return "github";
  if (appKey === "bannerbear" || appKey === "bananabear") return "bannerbear";
  
  return "app";
}

/**
 * Get display label for chat model provider
 */
export function chatModelProviderLabel(provider: string): string {
  const p = provider.trim().toLowerCase();
  if (p === "gemini") return "Gemini";
  if (p === "grok") return "Grok";
  return "OpenAI";
}
