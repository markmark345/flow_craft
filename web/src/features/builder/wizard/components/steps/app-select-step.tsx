"use client";

import { defaultActionKeyForApp, findAppAction, type AppKey } from "@/features/builder/nodeCatalog/catalog";
import { NodeIcon } from "@/features/builder/components/node-icon";
import { Input } from "@/shared/components/input";
import { cn } from "@/shared/lib/cn";
import { useWizardStore, type AppNodeDraft } from "../../store/use-wizard-store";
import { useAppSelectStep } from "../../hooks/use-app-select-step";

export function AppSelectStep() {
  const draft = useWizardStore((s) => s.draft) as AppNodeDraft;
  const setDraft = useWizardStore((s) => s.setDraft);
  const errors = useWizardStore((s) => s.validationErrors);

  const { query, setQuery, apps } = useAppSelectStep();

  const selectApp = (app: AppKey) => {
    const firstAction = defaultActionKeyForApp(app) || null;
    const meta = firstAction ? findAppAction(app, firstAction) : null;
    const label = meta?.label || "Action in an app";
    setDraft({
      app,
      action: firstAction,
      label,
      config: { app, action: firstAction || undefined },
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="text-sm font-semibold text-text">Choose an app</div>
        <div className="text-xs text-muted">Pick the app you want to use in this node.</div>
      </div>

      {errors.app ? <div className="text-xs text-red">{errors.app}</div> : null}

      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search apps..."
        className="h-10 bg-surface2"
      />

      <div className="grid grid-cols-2 gap-3">
        {apps.map((app) => {
          const selected = draft.app === app.appKey;
          return (
            <button
              key={app.appKey}
              type="button"
              onClick={() => selectApp(app.appKey)}
              className={cn(
                "text-left rounded-xl border p-4 bg-panel hover:bg-surface2 transition",
                selected ? "border-accent shadow-soft" : "border-border"
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-lg border flex items-center justify-center shrink-0"
                  style={{
                    background: "color-mix(in srgb, var(--accent) var(--accent-tint, 10%), transparent)",
                    borderColor: "color-mix(in srgb, var(--accent) 18%, transparent)",
                    color: "var(--accent)",
                  }}
                >
                  <NodeIcon nodeType={app.icon as any} className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-text truncate">{app.label}</div>
                  <div className="text-xs text-muted leading-snug mt-1">{app.description}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
