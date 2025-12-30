"use client";

import { NodeIcon } from "@/features/builder/components/node-icon";
import { APP_CATALOG, findAppAction } from "@/features/builder/nodeCatalog/catalog";

import { useWizardStore, type AppNodeDraft } from "../../store/use-wizard-store";

export function AppReviewStep() {
  const draft = useWizardStore((s) => s.draft) as AppNodeDraft;
  const app = draft.app ? APP_CATALOG[draft.app] : null;
  const action = draft.app && draft.action ? findAppAction(draft.app, draft.action) : null;

  return (
    <div className="space-y-4">
      <div>
        <div className="text-sm font-semibold text-text">Review</div>
        <div className="text-xs text-muted">Confirm the configuration before adding the node.</div>
      </div>

      <div className="rounded-xl border border-border bg-panel p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg border flex items-center justify-center"
            style={{
              background: "color-mix(in srgb, var(--accent) var(--accent-tint, 10%), transparent)",
              borderColor: "color-mix(in srgb, var(--accent) 18%, transparent)",
              color: "var(--accent)",
            }}
          >
            <NodeIcon nodeType={(app?.icon || "app") as any} className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold text-text">{draft.label}</div>
            <div className="text-xs text-muted">
              {app?.label || "App"} · {action?.label || draft.action || "Action"}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <div className="text-muted font-bold">App</div>
            <div className="text-text">{app?.label || "—"}</div>
          </div>
          <div>
            <div className="text-muted font-bold">Action</div>
            <div className="text-text">{action?.label || "—"}</div>
          </div>
          <div>
            <div className="text-muted font-bold">Credential</div>
            <div className="text-text">
              {typeof draft.config.credentialId === "string" && draft.config.credentialId.trim()
                ? draft.config.credentialId
                : "—"}
            </div>
          </div>
          <div>
            <div className="text-muted font-bold">Action key</div>
            <div className="text-text font-mono">{draft.action || "—"}</div>
          </div>
        </div>
      </div>

      <div className="text-xs text-muted">After adding, you can fine-tune settings in the Inspector panel.</div>
    </div>
  );
}
