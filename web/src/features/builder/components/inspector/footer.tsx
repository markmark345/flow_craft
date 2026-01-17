"use client";

import { Button } from "@/components/ui/button";
import { Node } from "reactflow";

import { FlowNodeData } from "../../types";

export function InspectorFooter({
  node,
  onDuplicate,
  onDelete,
}: {
  node?: Node<FlowNodeData>;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  if (!node) return null;

  return (
    <div className="p-4 border-t border-border bg-surface2">
      <div className="flex gap-3">
        <Button
          variant="secondary"
          size="sm"
          className="flex-1 flex items-center justify-center"
          onClick={() => onDuplicate(node.id)}
        >
          Duplicate
        </Button>
        <Button
          variant="danger"
          size="sm"
          className="flex-1 flex items-center justify-center"
          onClick={() => onDelete(node.id)}
        >
          Delete
        </Button>
      </div>
    </div>
  );
}
