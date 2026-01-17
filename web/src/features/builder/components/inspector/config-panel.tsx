"use client";

"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Node } from "reactflow";
import { FlowNodeData } from "../../types";
import { ConfigPanelHeader } from "./config-panel/ConfigPanelHeader";
import { ConfigForm } from "./config-panel/ConfigForm";
import { FailureHandling } from "./config-panel/FailureHandling";

export function InspectorConfigPanel({
  node,
  updateNodeData,
  updateNodeConfig,
}: {
  node: Node<FlowNodeData>;
  updateNodeData: (id: string, patch: Partial<FlowNodeData>) => void;
  updateNodeConfig: (id: string, patch: Record<string, unknown>) => void;
}) {
  return (
    <div className="space-y-6">
      <ConfigPanelHeader node={node} />

      <div className="space-y-2">
        <Label className="text-xs font-bold text-muted">Label</Label>
        <Input
          value={node.data.label}
          onChange={(e) => updateNodeData(node.id, { label: e.target.value })}
          className="h-10 rounded-lg bg-surface2"
        />
      </div>

      <ConfigForm
        node={node}
        updateNodeData={updateNodeData}
        updateNodeConfig={updateNodeConfig}
      />

      <FailureHandling node={node} updateNodeConfig={updateNodeConfig} />
    </div>
  );
}
