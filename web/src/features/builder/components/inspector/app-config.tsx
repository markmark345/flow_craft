"use client";

import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { SchemaForm } from "@/components/ui/SchemaForm/SchemaForm";
import { normalizeAppKey, defaultActionKeyForApp } from "../../nodeCatalog/catalog";
import { useInspectorAppConfig } from "../../hooks/use-inspector-app-config";

export function InspectorAppConfig({
  config,
  onPatch,
}: {
  config: Record<string, unknown>;
  onPatch: (patch: Record<string, unknown>) => void;
}) {
  const { appKey, app, actionKey, appOptions, actionOptions, schema } = useInspectorAppConfig(config, onPatch);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label className="text-xs font-bold text-muted">App</Label>
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
          <Label className="text-xs font-bold text-muted">Action</Label>
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
