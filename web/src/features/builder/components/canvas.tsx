"use client";

import React from "react";
import ReactFlow, {
  Background,
  MiniMap,
  BackgroundVariant,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import { BuilderTopbar } from "./builder-topbar";
import { NodePalette } from "./node-palette";
import { Inspector } from "./inspector";
import { LogsDrawer } from "./logs-drawer";
import { FlowNode } from "./flow-node";
import { Icon } from "@/shared/components/icon";
import { StickyNotesLayer } from "./sticky-notes-layer";
import { WizardModal } from "../wizard/components/wizard-modal";
import { useCanvas } from "../hooks/use-canvas";

export function BuilderCanvas() {
  const {
    rfInstance,
    setRfInstance,
    canvasRef,
    displayNodes,
    displayEdges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    setSelectedNote,
    viewport,
    onSelectionChange,
    deleteEdge,
    onDrop,
    onDragOver,
    onMoveEnd,
    baseEdgeStroke,
  } = useCanvas();

  return (
    <div className="h-screen flex">
      <NodePalette />
      <div className="flex-1 flex flex-col">
        <BuilderTopbar />
        <div className="flex-1 flex flex-col min-h-0">
          <div ref={canvasRef} className="relative flex-1 fc-canvas min-h-0">
            <ReactFlow
              nodes={displayNodes}
              edges={displayEdges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onSelectionChange={onSelectionChange}
              onPaneClick={() => setSelectedNote(undefined)}
              onEdgeDoubleClick={(_, edge) => deleteEdge(edge.id)}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onMoveEnd={onMoveEnd}
              onInit={(inst) => setRfInstance(inst)}
              nodeTypes={{ flowNode: FlowNode }}
              deleteKeyCode={["Backspace", "Delete"]}
              connectionLineStyle={{
                stroke: baseEdgeStroke,
                strokeWidth: 2.5,
                opacity: 0.95,
              }}
              defaultEdgeOptions={{
                type: "bezier",
                style: {
                  stroke: baseEdgeStroke,
                  strokeWidth: 2.5,
                  opacity: 0.95,
                },
                markerEnd: {
                  type: MarkerType.ArrowClosed,
                  width: 14,
                  height: 14,
                  color: baseEdgeStroke,
                },
                interactionWidth: 24,
              }}
              proOptions={{ hideAttribution: true }}
              defaultViewport={viewport}
              fitView
              className="h-full w-full bg-transparent"
            >
              <StickyNotesLayer />
              <Background gap={24} size={1.5} color="var(--grid)" variant={BackgroundVariant.Dots} />
              <MiniMap position="bottom-right" />
            </ReactFlow>

            {/* Floating Canvas Controls (n8n-ish) */}
            <div className="absolute bottom-6 left-6 flex flex-col gap-3 z-30">
              <div className="bg-panel rounded-lg shadow-lift border border-border flex flex-col overflow-hidden">
                <button
                  type="button"
                  className="p-2 hover:bg-surface2 text-muted border-b border-border active:bg-surface2 transition-colors"
                  title="Zoom in"
                  onClick={() => rfInstance?.zoomIn()}
                >
                  <Icon name="add" className="text-[20px]" />
                </button>
                <button
                  type="button"
                  className="p-2 hover:bg-surface2 text-muted active:bg-surface2 transition-colors"
                  title="Zoom out"
                  onClick={() => rfInstance?.zoomOut()}
                >
                  <Icon name="remove" className="text-[20px]" />
                </button>
              </div>
              <button
                type="button"
                className="bg-panel p-2 rounded-lg shadow-lift border border-border text-muted hover:bg-surface2 active:bg-surface2 transition-colors"
                title="Fit to screen"
                onClick={() => rfInstance?.fitView({ duration: 450, padding: 0.15 })}
              >
                <Icon name="center_focus_strong" className="text-[20px]" />
              </button>
            </div>
          </div>
          <LogsDrawer />
        </div>
      </div>
      <Inspector />
      <WizardModal />
    </div>
  );
}
