"use client";

import { useMemo, useState } from "react";

import { AGENT_TOOL_CATALOG } from "@/features/builder/nodeCatalog/catalog";
import { NodeIcon } from "@/features/builder/components/node-icon";
import { Input } from "@/shared/components/input";
import { Button } from "@/shared/components/button";
import { Icon } from "@/shared/components/icon";

import { useWizardStore, type AgentDraft } from "../../store/use-wizard-store";

export function AgentToolsStep() {
  const draft = useWizardStore((s) => s.draft) as AgentDraft;
  const setDraft = useWizardStore((s) => s.setDraft);
  const [query, setQuery] = useState("");

  const tools = draft.tools || [];

  const available = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return AGENT_TOOL_CATALOG;
    return AGENT_TOOL_CATALOG.filter((t) => `${t.label} ${t.toolKey}`.toLowerCase().includes(q));
  }, [query]);

  const addTool = (toolKey: string) => {
    const next = [
      ...tools,
      {
        id: crypto.randomUUID(),
        toolKey,
        enabled: true,
        credentialId: "",
        config: {},
      },
    ];
    setDraft({ tools: next });
  };

  const removeTool = (id: string) => {
    setDraft({ tools: tools.filter((t) => t.id !== id) });
  };

  return (
    <div className="space-y-5">
      <div>
        <div className="text-sm font-semibold text-text">Tools (optional)</div>
        <div className="text-xs text-muted">
          Add tools now, or skip and add later from the agent Inspector (Tools tab).
        </div>
      </div>

      {tools.length ? (
        <div className="rounded-xl border border-border bg-panel p-4">
          <div className="text-xs font-bold text-muted mb-3">Added tools</div>
          <div className="space-y-2">
            {tools.map((t) => {
              const def = AGENT_TOOL_CATALOG.find((d) => d.toolKey === t.toolKey);
              const icon =
                t.toolKey.startsWith("gmail.") ? "gmail" : t.toolKey.startsWith("gsheets.") ? "googleSheets" : t.toolKey.startsWith("github.") ? "github" : "app";
              return (
                <div key={t.id} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface px-3 py-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <NodeIcon nodeType={icon as any} className="h-4 w-4 text-muted" />
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-text truncate">{def?.label || t.toolKey}</div>
                      <div className="text-[11px] text-muted font-mono truncate">{t.toolKey}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="h-9 w-9 rounded-lg border border-border bg-surface2 text-muted hover:text-red hover:bg-surface transition-colors flex items-center justify-center"
                    onClick={() => removeTool(t.id)}
                    title="Remove"
                  >
                    <Icon name="delete" className="text-[18px]" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-surface2 p-4 text-xs text-muted">
          No tools added yet.
        </div>
      )}

      <div className="rounded-xl border border-border bg-panel p-4 space-y-3">
        <div className="text-xs font-bold text-muted">Available tools</div>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tools..."
          className="h-10 bg-surface2"
        />
        <div className="max-h-72 overflow-auto pr-1 space-y-2">
          {available.map((tool) => (
            <div
              key={tool.toolKey}
              className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface px-3 py-2"
            >
              <div className="min-w-0">
                <div className="text-sm font-semibold text-text truncate">{tool.label}</div>
                <div className="text-[11px] text-muted font-mono truncate">{tool.toolKey}</div>
              </div>
              <Button variant="secondary" size="sm" onClick={() => addTool(tool.toolKey)}>
                Add
              </Button>
            </div>
          ))}
          {available.length === 0 ? <div className="text-xs text-muted px-2 py-3">No matches</div> : null}
        </div>
      </div>
    </div>
  );
}

