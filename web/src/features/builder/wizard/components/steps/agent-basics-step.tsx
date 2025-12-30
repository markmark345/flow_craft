"use client";

import { Input } from "@/shared/components/input";

import { useWizardStore, type AgentDraft } from "../../store/use-wizard-store";

export function AgentBasicsStep() {
  const draft = useWizardStore((s) => s.draft) as AgentDraft;
  const setDraft = useWizardStore((s) => s.setDraft);
  const errors = useWizardStore((s) => s.validationErrors);

  return (
    <div className="space-y-5">
      <div>
        <div className="text-sm font-semibold text-text">Agent basics</div>
        <div className="text-xs text-muted">Give your agent a name.</div>
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-bold text-muted">
          Label <span className="text-red"> *</span>
        </label>
        <Input
          value={draft.label}
          onChange={(e) => setDraft({ label: e.target.value })}
          placeholder="AI Agent"
          className="h-10 rounded-lg bg-surface2"
        />
        {errors.label ? <div className="text-xs text-red">{errors.label}</div> : null}
      </div>
    </div>
  );
}

