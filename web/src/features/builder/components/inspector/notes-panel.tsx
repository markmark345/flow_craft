"use client";

import { Node } from "reactflow";
import { FlowNodeData } from "../../types";
import { Textarea } from "@/components/ui/textarea";

export function InspectorNotesPanel({
  node,
  updateNodeData,
}: {
  node?: Node<FlowNodeData>;
  updateNodeData: (id: string, patch: Partial<FlowNodeData>) => void;
}) {
  if (!node) {
    return <div className="text-sm text-muted">Notes are only available for nodes.</div>;
  }

  return (
    <div className="space-y-2">
      <div className="text-xs font-bold uppercase tracking-wide text-muted">Notes</div>
      <Textarea
        value={node.data.notes || ""}
        onChange={(e) => updateNodeData(node.id, { notes: e.target.value })}
        className="min-h-[160px] bg-surface2"
        placeholder="Add notes for this node"
      />
    </div>
  );
}
