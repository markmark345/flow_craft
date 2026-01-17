"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";
import { useWizardStore, type AgentToolDraft } from "../../store/use-wizard-store";
import { useToolSelectStep } from "../../hooks/use-tool-select-step";

export function ToolSelectStep() {
  const draft = useWizardStore((s) => s.draft) as AgentToolDraft;
  const setDraft = useWizardStore((s) => s.setDraft);
  const errors = useWizardStore((s) => s.validationErrors);

  const { query, setQuery, tools } = useToolSelectStep();

  return (
    <div className="space-y-4">
      <div>
        <div className="text-sm font-semibold text-text">Choose a tool</div>
        <div className="text-xs text-muted">Tools run inside the agent and are not separate canvas nodes.</div>
      </div>

      {errors.toolKey ? <div className="text-xs text-red">{errors.toolKey}</div> : null}

      <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search tools..." className="h-10 bg-surface2" />

      <div className="max-h-[420px] overflow-auto pr-1 space-y-2">
        {tools.map((tool) => {
          const selected = draft.toolKey === tool.toolKey;
          return (
            <Button
              key={tool.toolKey}
              variant="ghost"
              className={cn(
                "w-full justify-start text-left rounded-xl border px-4 py-3 bg-panel hover:bg-surface2 transition h-auto font-normal block",
                selected ? "border-accent shadow-soft" : "border-border"
              )}
              onClick={() => setDraft({ toolKey: tool.toolKey })}
            >
              <div className="text-sm font-bold text-text">{tool.label}</div>
              <div className="text-xs text-muted font-mono mt-0.5">{tool.toolKey}</div>
              <div className="text-xs text-muted mt-1">{tool.app}</div>
            </Button>
          );
        })}
        {tools.length === 0 ? <div className="text-xs text-muted px-2 py-3">No matches</div> : null}
      </div>
    </div>
  );
}
