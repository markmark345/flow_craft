"use client";

import { Badge } from "@/shared/components/badge";
import { RunStepDTO } from "@/shared/types/dto";
import { Edge, Node } from "reactflow";

import { FlowNodeData } from "../types";

export function InspectorIoPanel({
  activeRunId,
  selectedNode,
  selectedNodeStep,
  selectedEdge,
  sourceNode,
  targetNode,
  sourceStep,
  targetStep,
}: {
  activeRunId: string | null;
  selectedNode?: Node<FlowNodeData>;
  selectedNodeStep?: RunStepDTO;
  selectedEdge?: Edge;
  sourceNode?: Node<FlowNodeData>;
  targetNode?: Node<FlowNodeData>;
  sourceStep?: RunStepDTO;
  targetStep?: RunStepDTO;
}) {
  if (selectedNode) {
    return (
      <div className="space-y-5">
        {activeRunId ? (
          selectedNodeStep ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs font-bold uppercase tracking-wide text-muted">Last run</div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-mono text-muted">{selectedNodeStep.stepKey}</span>
                  <Badge label={selectedNodeStep.status} tone={stepTone(selectedNodeStep.status)} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wide text-muted">Inputs</div>
                <pre className="text-xs whitespace-pre break-words rounded-lg bg-surface2 border border-border p-3 font-mono text-text overflow-auto max-h-[24vh]">
                  {pretty(selectedNodeStep.inputs) || "—"}
                </pre>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wide text-muted">Outputs</div>
                <pre className="text-xs whitespace-pre break-words rounded-lg bg-surface2 border border-border p-3 font-mono text-text overflow-auto max-h-[24vh]">
                  {pretty(selectedNodeStep.outputs) || "—"}
                </pre>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted">No run data for this node yet.</div>
          )
        ) : (
          <div className="text-sm text-muted">Run the flow to see input/output.</div>
        )}

        <div className="space-y-2 pt-2 border-t border-border">
          <div className="text-xs font-bold uppercase tracking-wide text-muted">Current config</div>
          <pre className="text-xs whitespace-pre-wrap rounded-lg bg-surface2 border border-border p-3 font-mono text-text">
            {JSON.stringify(selectedNode.data.config, null, 2)}
          </pre>
        </div>
      </div>
    );
  }

  if (selectedEdge) {
    return (
      <div className="space-y-5">
        {!activeRunId ? <div className="text-sm text-muted">Run the flow to see input/output.</div> : null}

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs font-bold uppercase tracking-wide text-muted">From</div>
            {sourceStep ? (
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-mono text-muted">{sourceStep.stepKey}</span>
                <Badge label={sourceStep.status} tone={stepTone(sourceStep.status)} />
              </div>
            ) : null}
          </div>
          <div className="text-sm text-text truncate">{sourceNode?.data.label || selectedEdge.source}</div>
          <pre className="text-xs whitespace-pre break-words rounded-lg bg-surface2 border border-border p-3 font-mono text-text overflow-auto max-h-[22vh]">
            {pretty(sourceStep?.outputs) || "—"}
          </pre>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs font-bold uppercase tracking-wide text-muted">To</div>
            {targetStep ? (
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-mono text-muted">{targetStep.stepKey}</span>
                <Badge label={targetStep.status} tone={stepTone(targetStep.status)} />
              </div>
            ) : null}
          </div>
          <div className="text-sm text-text truncate">{targetNode?.data.label || selectedEdge.target}</div>

          <div className="space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wide text-muted">Inputs</div>
            <pre className="text-xs whitespace-pre break-words rounded-lg bg-surface2 border border-border p-3 font-mono text-text overflow-auto max-h-[18vh]">
              {pretty(targetStep?.inputs) || "—"}
            </pre>
          </div>

          <div className="space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wide text-muted">Outputs</div>
            <pre className="text-xs whitespace-pre break-words rounded-lg bg-surface2 border border-border p-3 font-mono text-text overflow-auto max-h-[18vh]">
              {pretty(targetStep?.outputs) || "—"}
            </pre>
          </div>
        </div>
      </div>
    );
  }

  return <div className="text-sm text-muted">Select a node or edge.</div>;
}

function stepTone(status?: RunStepDTO["status"]) {
  if (status === "success") return "success";
  if (status === "failed") return "danger";
  if (status === "running" || status === "queued") return "warning";
  return "default";
}

function pretty(value: unknown) {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}
