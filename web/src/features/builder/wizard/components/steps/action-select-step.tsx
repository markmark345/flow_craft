"use client";

import { AppActionList } from "@/features/builder/components/app-action-list";
import { findAppAction } from "@/features/builder/nodeCatalog/catalog";

import { useWizardStore, type AppNodeDraft } from "../../store/use-wizard-store";

export function ActionSelectStep() {
  const draft = useWizardStore((s) => s.draft) as AppNodeDraft;
  const setDraft = useWizardStore((s) => s.setDraft);
  const errors = useWizardStore((s) => s.validationErrors);

  if (!draft.app) {
    return <div className="text-sm text-muted">Choose an app first.</div>;
  }

  const appKey = draft.app;

  return (
    <div className="space-y-4">
      {errors.action ? <div className="text-xs text-red">{errors.action}</div> : null}

      <AppActionList
        appKey={appKey}
        selectedActionKey={draft.action}
        onSelect={(actionKey) => {
          const meta = findAppAction(appKey, actionKey);
          setDraft({
            action: actionKey,
            label: meta?.label || draft.label,
            config: { action: actionKey },
          });
        }}
      />
    </div>
  );
}

