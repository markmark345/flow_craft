"use client";

import { Node } from "reactflow";
import { FlowNodeData } from "../../../types";
import { NODE_CATALOG } from "../../../types/node-catalog";
import { FieldRow } from "../field-row";

interface FailureHandlingProps {
  node: Node<FlowNodeData>;
  updateNodeConfig: (id: string, patch: Record<string, unknown>) => void;
}

/**
 * FailureHandling — renders Failure handling + Retry config for a node in the inspector.
 * Maps to backend fields: continueOnFail, routeToErrorTrigger, maxAttempts, initialInterval.
 */
export function FailureHandling({ node, updateNodeConfig }: FailureHandlingProps) {
  const meta = NODE_CATALOG[node.data.nodeType];
  const isTrigger = meta?.category === "Triggers";
  const maxAttempts = Number(node.data.config?.maxAttempts ?? 1);

  return (
    <div className="space-y-2 pt-4 border-t border-border">
      {/* ── Failure handling ── */}
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
      {!isTrigger ? (
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

      {/* ── Retry ── */}
      {!isTrigger ? (
        <div className="space-y-2 pt-3">
          <div className="text-xs font-bold uppercase tracking-wide text-muted">Retry</div>
          <FieldRow
            field={{
              key: "maxAttempts",
              label: "Retry attempts",
              type: "number",
              placeholder: "1",
              helpText: "How many times to retry this node on failure. 1 = no retry.",
            }}
            value={node.data.config?.maxAttempts ?? 1}
            onChange={(v) => updateNodeConfig(node.id, { maxAttempts: Math.max(1, Number(v)) })}
          />
          {/* Show initial interval only when retries are enabled */}
          {maxAttempts > 1 ? (
            <FieldRow
              field={{
                key: "initialInterval",
                label: "Initial interval (ms)",
                type: "number",
                placeholder: "1000",
                helpText: "Wait before first retry. Doubles on each attempt (2× exponential backoff).",
              }}
              value={node.data.config?.initialInterval ?? 1000}
              onChange={(v) => updateNodeConfig(node.id, { initialInterval: Math.max(100, Number(v)) })}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
