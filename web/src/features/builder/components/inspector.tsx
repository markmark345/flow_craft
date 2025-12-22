"use client";

import { useEffect, useMemo, useState } from "react";

import { useBuilderStore } from "../store/use-builder-store";
import { useRunStepsStore } from "@/features/runs/store/use-run-steps-store";
import { RunStepDTO } from "@/shared/types/dto";

import { InspectorConfigPanel } from "./inspector-config-panel";
import { InspectorEdgeSummary } from "./inspector-edge-summary";
import { InspectorIoPanel } from "./inspector-io-panel";
import { InspectorNotesPanel } from "./inspector-notes-panel";
import { InspectorFooter } from "./inspector-footer";

export function Inspector() {
  const [tab, setTab] = useState("config");
  const selectedNodeId = useBuilderStore((s) => s.selectedNodeId);
  const selectedEdgeId = useBuilderStore((s) => s.selectedEdgeId);
  const nodes = useBuilderStore((s) => s.nodes);
  const edges = useBuilderStore((s) => s.edges);
  const activeRunId = useBuilderStore((s) => s.activeRunId);
  const updateNodeData = useBuilderStore((s) => s.updateNodeData);
  const updateNodeConfig = useBuilderStore((s) => s.updateNodeConfig);
  const deleteNode = useBuilderStore((s) => s.deleteNode);
  const duplicateNode = useBuilderStore((s) => s.duplicateNode);

  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedNodeId),
    [nodes, selectedNodeId]
  );
  const selectedEdge = useMemo(() => edges.find((e) => e.id === selectedEdgeId), [edges, selectedEdgeId]);

  useEffect(() => {
    if (!selectedEdge) return;
    setTab("io");
  }, [selectedEdgeId, selectedEdge]);

  const steps =
    useRunStepsStore((s) => (activeRunId ? s.stepsByRunId[activeRunId] : undefined)) || [];
  const stepByNodeId = useMemo(() => {
    const map = new Map<string, RunStepDTO>();
    for (const step of steps) {
      if (step.nodeId) map.set(step.nodeId, step);
    }
    return map;
  }, [steps]);

  const selectedNodeStep = selectedNode ? stepByNodeId.get(selectedNode.id) : undefined;
  const sourceNode = selectedEdge ? nodes.find((n) => n.id === selectedEdge.source) : undefined;
  const targetNode = selectedEdge ? nodes.find((n) => n.id === selectedEdge.target) : undefined;
  const sourceStep = selectedEdge ? stepByNodeId.get(selectedEdge.source) : undefined;
  const targetStep = selectedEdge ? stepByNodeId.get(selectedEdge.target) : undefined;

  return (
    <aside className="w-80 bg-panel border-l border-border flex flex-col z-20 shadow-[0_4px_24px_-12px_rgba(0,0,0,0.1)]">
      <div className="flex border-b border-border bg-surface2">
        <button
          type="button"
          className={`flex-1 py-3 text-xs font-bold ${
            tab === "config" ? "text-accent border-b-2 border-accent bg-panel" : "text-muted hover:text-text"
          }`}
          onClick={() => setTab("config")}
        >
          Configuration
        </button>
        <button
          type="button"
          className={`flex-1 py-3 text-xs font-bold ${
            tab === "io" ? "text-accent border-b-2 border-accent bg-panel" : "text-muted hover:text-text"
          }`}
          onClick={() => setTab("io")}
        >
          Input / Output
        </button>
        <button
          type="button"
          className={`flex-1 py-3 text-xs font-bold ${
            tab === "notes" ? "text-accent border-b-2 border-accent bg-panel" : "text-muted hover:text-text"
          }`}
          onClick={() => setTab("notes")}
        >
          Notes
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        {!selectedNode && !selectedEdge ? (
          <div className="text-sm text-muted">Select a node or edge.</div>
        ) : tab === "config" ? (
          selectedNode ? (
            <InspectorConfigPanel
              node={selectedNode}
              updateNodeData={updateNodeData}
              updateNodeConfig={updateNodeConfig}
            />
          ) : (
            <InspectorEdgeSummary
              sourceLabel={sourceNode?.data.label || selectedEdge?.source || ""}
              targetLabel={targetNode?.data.label || selectedEdge?.target || ""}
            />
          )
        ) : tab === "io" ? (
          <InspectorIoPanel
            activeRunId={activeRunId}
            selectedNode={selectedNode}
            selectedNodeStep={selectedNodeStep}
            selectedEdge={selectedEdge}
            sourceNode={sourceNode}
            targetNode={targetNode}
            sourceStep={sourceStep}
            targetStep={targetStep}
          />
        ) : (
          <InspectorNotesPanel node={selectedNode} updateNodeData={updateNodeData} />
        )}
      </div>

      <InspectorFooter node={selectedNode} onDuplicate={duplicateNode} onDelete={deleteNode} />
    </aside>
  );
}
