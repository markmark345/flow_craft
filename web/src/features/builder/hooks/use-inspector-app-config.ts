import { useEffect, useMemo } from "react";
import type { SelectOption } from "@/shared/components/select";
import type { SchemaField } from "@/shared/components/SchemaForm/types";
import {
  APP_CATALOG,
  defaultActionKeyForApp,
  findAppAction,
  listAppActions,
  normalizeAppKey,
  type AppKey,
} from "../nodeCatalog/catalog";

export interface UseInspectorAppConfigReturn {
  appKey: AppKey;
  app: typeof APP_CATALOG[AppKey];
  actionKey: string;
  action: ReturnType<typeof findAppAction>;
  appOptions: SelectOption[];
  actionOptions: SelectOption[];
  schema: SchemaField[];
}

/**
 * Custom hook for managing app configuration in inspector.
 * Handles app/action normalization, options generation, and schema computation.
 */
export function useInspectorAppConfig(
  config: Record<string, unknown>,
  onPatch: (patch: Record<string, unknown>) => void
): UseInspectorAppConfigReturn {
  const appKey = (normalizeAppKey(config.app) || "googleSheets") satisfies AppKey;
  const app = APP_CATALOG[appKey];

  const actionKeyFromConfig = typeof config.action === "string" ? config.action.trim() : "";
  const defaultActionKey = defaultActionKeyForApp(appKey);
  const actionKey = actionKeyFromConfig || defaultActionKey || "";
  const action = actionKey ? findAppAction(appKey, actionKey) : null;

  useEffect(() => {
    if (!actionKeyFromConfig && defaultActionKey) {
      onPatch({ app: appKey, action: defaultActionKey });
      return;
    }
    if (actionKeyFromConfig && !findAppAction(appKey, actionKeyFromConfig) && defaultActionKey) {
      onPatch({ action: defaultActionKey });
    }
  }, [actionKeyFromConfig, appKey, defaultActionKey, onPatch]);

  const appOptions = useMemo<SelectOption[]>(
    () =>
      Object.values(APP_CATALOG).map((a) => ({
        value: a.appKey,
        label: a.label,
        description: a.description,
      })),
    []
  );

  const actionOptions = useMemo<SelectOption[]>(
    () =>
      listAppActions(appKey)
        .filter((a) => !a.disabled && (a.kind || "action") === "action")
        .map((a) => ({
          value: a.actionKey,
          label: a.label,
          description: a.categoryLabel,
        })),
    [appKey]
  );

  const schema = useMemo<SchemaField[]>(() => {
    const base = app.baseFields || [];
    const fields = action?.fields || [];
    return [...base, ...fields];
  }, [action, app.baseFields]);

  return {
    appKey,
    app,
    actionKey,
    action,
    appOptions,
    actionOptions,
    schema,
  };
}
