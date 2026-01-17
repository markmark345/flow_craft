"use client";

import { InspectorConfigPanel } from "./config-panel";
import { InspectorEdgeSummary } from "./edge-summary";
import { InspectorIoPanel } from "./io-panel";
import { InspectorNotesPanel } from "./notes-panel";
import { InspectorFooter } from "./footer";
import { useInspector } from "../../hooks/use-inspector";

export function Inspector() {
  const {
    tab,
    setTab,
    selectedNode,
    selectedEdge,
    sourceNode,
    targetNode,
    selectedNodeStep,
    sourceStep,
    targetStep,
    activeRunId,
    updateNodeData,
    updateNodeConfig,
    deleteNode,
    duplicateNode,
  } = useInspector();

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
            activeRunId={activeRunId ?? null}
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
