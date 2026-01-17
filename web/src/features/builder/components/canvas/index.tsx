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
import { NodePalette } from "../node/node-palette";
import { Inspector } from "../inspector";
import { LogsDrawer } from "./logs-drawer";
import { CanvasControls } from "./canvas-controls";
import { FlowNode } from "../node/flow-node";
import { Icon } from "@/components/ui/icon";
import { StickyNotesLayer } from "../sticky-notes/layer";
import { WizardModal } from "../../wizard/components/wizard-modal";
import { useCanvas } from "../../hooks/use-canvas";

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

            <CanvasControls
              onZoomIn={() => rfInstance?.zoomIn()}
              onZoomOut={() => rfInstance?.zoomOut()}
              onFitView={() => rfInstance?.fitView({ duration: 450, padding: 0.15 })}
            />
          </div>
          <LogsDrawer />
        </div>
      </div>
      <Inspector />
      <WizardModal />
    </div>
  );
}
