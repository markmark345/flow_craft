"use client";

import { Node } from "reactflow";
import { FlowNodeData } from "../../types";

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
      <textarea
        value={node.data.notes || ""}
        onChange={(e) => updateNodeData(node.id, { notes: e.target.value })}
        className="w-full min-h-[160px] rounded-lg bg-surface2 border border-border px-3 py-2 text-sm text-text placeholder:text-muted focus:outline-none focus:shadow-focus"
        placeholder="Add notes for this node"
      />
    </div>
  );
}
