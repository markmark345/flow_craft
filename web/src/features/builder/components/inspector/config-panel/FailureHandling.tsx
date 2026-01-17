"use client";

import { Node } from "reactflow";
import { FlowNodeData } from "../../../types";
import { NODE_CATALOG } from "../../../types/node-catalog";
import { FieldRow } from "../field-row";

interface FailureHandlingProps {
  node: Node<FlowNodeData>;
  updateNodeConfig: (id: string, patch: Record<string, unknown>) => void;
}

export function FailureHandling({ node, updateNodeConfig }: FailureHandlingProps) {
  const meta = NODE_CATALOG[node.data.nodeType];

  return (
    <div className="space-y-2 pt-4 border-t border-border">
      <div className="text-xs font-bold uppercase tracking-wide text-muted">Failure handling</div>
      <FieldRow
        field={{
          key: "continueOnFail",
          label: "Continue on fail",
          type: "toggle",
          helpText: "When enabled, the workflow continues even if this node errors.",
        }}
        value={node.data.config?.continueOnFail}
        onChange={(v) => updateNodeConfig(node.id, { continueOnFail: v })}
      />
      {meta?.category !== "Triggers" ? (
        <FieldRow
          field={{
            key: "routeToErrorTrigger",
            label: "Route to error trigger",
            type: "toggle",
            helpText:
              "When enabled, if this node errors the workflow jumps to the Error Trigger branch (if present).",
          }}
          value={node.data.config?.routeToErrorTrigger}
          onChange={(v) => updateNodeConfig(node.id, { routeToErrorTrigger: v })}
        />
      ) : null}
    </div>
  );
}
