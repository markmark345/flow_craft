"use client";

import { AGENT_TOOL_CATALOG } from "@/features/builder/nodeCatalog/catalog";

import { useWizardStore, type AgentToolDraft } from "../../store/use-wizard-store";

export function ToolReviewStep() {
  const draft = useWizardStore((s) => s.draft) as AgentToolDraft;
  const tool = AGENT_TOOL_CATALOG.find((t) => t.toolKey === draft.toolKey) || null;

  return (
    <div className="space-y-4">
      <div>
        <div className="text-sm font-semibold text-text">Review</div>
        <div className="text-xs text-muted">Confirm the tool configuration before adding it to the agent.</div>
      </div>

      <div className="rounded-xl border border-border bg-panel p-4 space-y-3">
        <div className="text-sm font-bold text-text">{tool?.label || draft.toolKey || "Tool"}</div>
        <div className="text-xs text-muted font-mono">{draft.toolKey || "—"}</div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <div className="text-muted font-bold">App</div>
            <div className="text-text">{tool?.app || "—"}</div>
          </div>
          <div>
            <div className="text-muted font-bold">Credential</div>
            <div className="text-text">
              {typeof draft.config.credentialId === "string" && draft.config.credentialId.trim()
                ? draft.config.credentialId
                : "—"}
            </div>
          </div>
        </div>
      </div>

      <div className="text-xs text-muted">After adding, you can edit tool settings from the Agent inspector.</div>
    </div>
  );
}

