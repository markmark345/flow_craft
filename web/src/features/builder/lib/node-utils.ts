/**
 * Flow node utilities
 * Provides utilities for node configuration validation and label extraction
 */

import { APP_CATALOG, findAppAction, normalizeAppKey } from "../nodeCatalog/catalog";
import { isConfiguredValue } from "@/shared/lib/validation-utils";

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
