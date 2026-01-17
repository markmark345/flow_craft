"use client";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { AgentToolItem } from "./AgentToolItem";
import { AgentToolConfig } from "../../../types/agent";

type Props = {
  tools: AgentToolConfig[];
  flowId?: string;
  nodeId: string;
  openAddTool: (flowId: string, nodeId: string) => void;
  onMove: (idx: number, dir: -1 | 1) => void;
  onDelete: (id: string) => void;
  onToggleEnabled: (id: string, enabled: boolean) => void;
  onPatch: (id: string, patch: Record<string, unknown>) => void;
};

export function AgentToolsTab({
  tools,
  flowId,
  nodeId,
  openAddTool,
  onMove,
  onDelete,
  onToggleEnabled,
  onPatch,
}: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-bold text-text">Tools</div>
          <div className="text-xs text-muted">Configure tool connections available to the agent.</div>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            if (!flowId) return;
            openAddTool(flowId, nodeId);
          }}
        >
          <Icon name="add" className="text-[18px] mr-1" />
          Add tool
        </Button>
      </div>

      {tools.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface2 p-4 text-xs text-muted">
          No tools yet.
        </div>
      ) : (
        <div className="space-y-3">
          {tools.map((tool, idx) => (
            <AgentToolItem
              key={tool.id}
              tool={tool}
              idx={idx}
              totalTools={tools.length}
              onMove={onMove}
              onDelete={onDelete}
              onToggleEnabled={onToggleEnabled}
              onPatch={onPatch}
              running={false} // Will be passed from parent if needed
            />
          ))}
        </div>
      )}
    </div>
  );
}
