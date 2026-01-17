"use client";

import { NodeIcon } from "@/features/builder/components/node/node-icon";
import { isValidAgentModelConfig } from "@/features/builder/types/agent";

import { useWizardStore, type AgentDraft } from "../../store/use-wizard-store";

export function AgentReviewStep() {
  const draft = useWizardStore((s) => s.draft) as AgentDraft;

  const model = draft.model;
  const provider = model?.provider || "openai";
  const modelName = model?.model || "";
  const toolsCount = (draft.tools || []).length;
  const memory = draft.memory?.type || "none";

  return (
    <div className="space-y-4">
      <div>
        <div className="text-sm font-semibold text-text">Review</div>
        <div className="text-xs text-muted">Confirm the AI Agent configuration before adding it.</div>
      </div>

      <div className="rounded-xl border border-border bg-panel p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg border flex items-center justify-center"
            style={{
              background: "color-mix(in srgb, var(--muted) 10%, transparent)",
              borderColor: "color-mix(in srgb, var(--border) 70%, transparent)",
              color: "var(--muted)",
            }}
          >
            <NodeIcon nodeType="aiAgent" className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold text-text">{draft.label}</div>
            <div className="text-xs text-muted">AI Agent</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <div className="text-muted font-bold">Model</div>
            <div className="text-text flex items-center gap-2">
              <NodeIcon nodeType={(provider as any) === "custom" ? "chatModel" : (provider as any)} className="h-4 w-4" />
              <span className="font-mono">{modelName || "—"}</span>
            </div>
            {!isValidAgentModelConfig(model) ? (
              <div className="text-red mt-1">Missing model configuration</div>
            ) : null}
          </div>

          <div>
            <div className="text-muted font-bold">Memory</div>
            <div className="text-text">{memory === "conversation" ? "Conversation" : "None"}</div>
          </div>

          <div>
            <div className="text-muted font-bold">Tools</div>
            <div className="text-text">{toolsCount ? `${toolsCount} added` : "None"}</div>
          </div>

          <div>
            <div className="text-muted font-bold">Prompt</div>
            <div className="text-text font-mono">
              {typeof draft.config?.prompt === "string" ? draft.config.prompt : "{{input}}"}
            </div>
          </div>
        </div>
      </div>

      <div className="text-xs text-muted">
        After adding, configure prompts, tools, and memory in the Inspector panel.
      </div>
    </div>
  );
}

