"use client";

import { Select, type SelectOption } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

import { useWizardStore, type AgentDraft } from "../../store/use-wizard-store";

const options: SelectOption[] = [
  { value: "none", label: "None", description: "No memory between runs" },
  { value: "conversation", label: "Conversation", description: "Keep recent context in memory" },
];

export function AgentMemoryStep() {
  const draft = useWizardStore((s) => s.draft) as AgentDraft;
  const setDraft = useWizardStore((s) => s.setDraft);

  const type = draft.memory?.type || "none";

  return (
    <div className="space-y-4">
      <div>
        <div className="text-sm font-semibold text-text">Memory (optional)</div>
        <div className="text-xs text-muted">Choose whether the agent should remember previous context.</div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-bold text-muted">Memory type</Label>
        <Select
          value={type}
          options={options}
          onChange={(v) => {
            if (v === "conversation") setDraft({ memory: { type: "conversation", config: {} } as any });
            else setDraft({ memory: null });
          }}
        />
      </div>

      <div className="text-xs text-muted">
        You can extend memory types later (vector stores, etc). For now, conversation memory is a simple placeholder.
      </div>
    </div>
  );
}

