"use client";

import { useMemo } from "react";

import { SchemaForm } from "@/shared/components/SchemaForm/SchemaForm";
import type { SchemaField } from "@/shared/components/SchemaForm/types";
import { APP_CATALOG, AGENT_TOOL_CATALOG } from "@/features/builder/nodeCatalog/catalog";

import { useWizardStore, type AppNodeDraft, type AgentToolDraft } from "../../store/use-wizard-store";

export function WizardCredentialStep() {
  const mode = useWizardStore((s) => s.mode);
  const draft = useWizardStore((s) => s.draft) as any;
  const setDraft = useWizardStore((s) => s.setDraft);
  const errors = useWizardStore((s) => s.validationErrors);

  const schema = useMemo<SchemaField[]>(() => {
    if (mode === "add-agent-tool") {
      const d = draft as AgentToolDraft;
      const tool = AGENT_TOOL_CATALOG.find((t) => t.toolKey === d.toolKey);
      return tool?.baseFields || [];
    }
    const d = draft as AppNodeDraft;
    if (!d.app) return [];
    return APP_CATALOG[d.app]?.baseFields || [];
  }, [draft, mode]);

  if (mode === "add-app-node" && !(draft as AppNodeDraft).app) {
    return <div className="text-sm text-muted">Choose an app first.</div>;
  }
  if (mode === "add-agent-tool" && !(draft as AgentToolDraft).toolKey) {
    return <div className="text-sm text-muted">Choose a tool first.</div>;
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="text-sm font-semibold text-text">Credential</div>
        <div className="text-xs text-muted">Select a credential to connect with.</div>
      </div>

      {errors.credentialId ? <div className="text-xs text-red">{errors.credentialId}</div> : null}

      <SchemaForm
        schema={schema}
        value={draft.config || {}}
        errors={errors}
        onPatch={(patch) => setDraft({ config: patch })}
      />
    </div>
  );
}

