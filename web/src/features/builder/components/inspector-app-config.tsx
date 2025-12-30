"use client";

import { useEffect, useMemo } from "react";

import { Select, type SelectOption } from "@/shared/components/select";
import { SchemaForm } from "@/shared/components/SchemaForm/SchemaForm";
import type { SchemaField } from "@/shared/components/SchemaForm/types";

import {
  APP_CATALOG,
  defaultActionKeyForApp,
  findAppAction,
  listAppActions,
  normalizeAppKey,
  type AppKey,
} from "../nodeCatalog/catalog";

export function InspectorAppConfig({
  config,
  onPatch,
}: {
  config: Record<string, unknown>;
  onPatch: (patch: Record<string, unknown>) => void;
}) {
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

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <div className="block text-xs font-bold text-muted">App</div>
          <Select
            value={appKey}
            options={appOptions}
            onChange={(v) => {
              const nextApp = normalizeAppKey(v) || appKey;
              const nextAction = defaultActionKeyForApp(nextApp);
              onPatch({ app: nextApp, action: nextAction });
            }}
            searchable
            searchPlaceholder="Search apps..."
            placeholder="Select an app..."
          />
        </div>

        <div className="space-y-2">
          <div className="block text-xs font-bold text-muted">Action</div>
          <Select
            value={actionKey || ""}
            options={actionOptions}
            onChange={(v) => onPatch({ action: v })}
            searchable
            searchPlaceholder={`Search ${app.label} actions...`}
            placeholder="Select an action..."
          />
        </div>
      </div>

      <SchemaForm schema={schema} value={config} onPatch={onPatch} />
    </div>
  );
}

