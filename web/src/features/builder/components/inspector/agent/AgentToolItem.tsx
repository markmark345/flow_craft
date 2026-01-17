"use client";

import { IconButton } from "@/components/ui/icon-button";
import { SchemaForm } from "@/components/ui/SchemaForm/SchemaForm";
import { NodeIcon } from "../../node/node-icon";
import { AgentToolConfig } from "../../../types/agent";
import { AGENT_TOOL_CATALOG } from "../../../nodeCatalog/catalog";
import { toolIconFor, toolSchemaFor, validateTool } from "./agent-config-utils";

type Props = {
  tool: AgentToolConfig;
  idx: number;
  totalTools: number;
  running: boolean;
  runningFlowId?: string;
  onMove: (idx: number, dir: -1 | 1) => void;
  onDelete: (id: string) => void;
  onToggleEnabled: (id: string, enabled: boolean) => void;
  onPatch: (id: string, patch: Record<string, unknown>) => void;
};

export function AgentToolItem({
  tool,
  idx,
  totalTools,
  running,
  runningFlowId,
  onMove,
  onDelete,
  onToggleEnabled,
  onPatch,
}: Props) {
  const def = AGENT_TOOL_CATALOG.find((t) => t.toolKey === tool.toolKey);
  const schema = toolSchemaFor(tool.toolKey);
  const errors = validateTool(tool);
  const value = { credentialId: tool.credentialId || "", ...(tool.config || {}) };
  const icon = toolIconFor(tool.toolKey);
  const valid = Object.keys(errors).length === 0;

  return (
    <div key={tool.id} className="rounded-xl border border-border bg-panel p-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="w-9 h-9 rounded-lg border flex items-center justify-center shrink-0"
            style={{
              background: "color-mix(in srgb, var(--muted) 10%, transparent)",
              borderColor: "color-mix(in srgb, var(--border) 70%, transparent)",
              color: "var(--muted)",
            }}
          >
            <NodeIcon nodeType={icon as any} className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold text-text truncate">{def?.label || tool.toolKey}</div>
            <div className="text-[11px] text-muted font-mono truncate">{tool.toolKey}</div>
          </div>
          <span
            className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
              valid ? "text-green border-green/30 bg-green/10" : "text-red border-red/30 bg-red/10"
            }`}
            title={valid ? "Configured" : "Needs config"}
          >
            {valid ? "Configured" : "Needs config"}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <IconButton
            icon="arrow_upward"
            className="h-9 w-9 border border-border bg-surface2 text-muted hover:text-text hover:bg-surface transition-colors"
            onClick={() => onMove(idx, -1)}
            disabled={idx === 0}
            title="Move up"
          />
          <IconButton
            icon="arrow_downward"
            className="h-9 w-9 border border-border bg-surface2 text-muted hover:text-text hover:bg-surface transition-colors"
            onClick={() => onMove(idx, 1)}
            disabled={idx === totalTools - 1}
            title="Move down"
          />
          <IconButton
            icon={tool.enabled ? "toggle_on" : "toggle_off"}
            className="h-9 w-9 border border-border bg-surface2 text-muted hover:text-text hover:bg-surface transition-colors"
            onClick={() => onToggleEnabled(tool.id, !tool.enabled)}
            title={tool.enabled ? "Disable" : "Enable"}
          />
          <IconButton
            icon="delete"
            className="h-9 w-9 border border-border bg-surface2 text-muted hover:text-red hover:bg-surface transition-colors"
            onClick={() => onDelete(tool.id)}
            title="Delete"
          />
        </div>
      </div>

      <SchemaForm
        schema={schema}
        value={value}
        errors={errors}
        onPatch={(patch) => onPatch(tool.id, patch)}
      />
    </div>
  );
}
