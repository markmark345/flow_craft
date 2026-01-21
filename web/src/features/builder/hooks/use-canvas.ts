
import { useEffect, useRef, useState } from "react";
import { type ReactFlowInstance } from "reactflow";
import { useBuilderStore } from "../store/use-builder-store";
import { useRunStepsQuery } from "@/features/runs/hooks/use-run-steps";

import { useCanvasDisplay } from "./use-canvas-display";
import { useCanvasEvents } from "./use-canvas-events";

/**
 * Custom hook for managing Builder Canvas state and logic.
 * Handles ReactFlow instance, node/edge display, drag-and-drop, and run visualization.
 */
export function useCanvas() {
  // Builder store state
  const nodes = useBuilderStore((s) => s.nodes);
  const edges = useBuilderStore((s) => s.edges);
  const onNodesChange = useBuilderStore((s) => s.onNodesChange);
  const onEdgesChange = useBuilderStore((s) => s.onEdgesChange);
  const onConnect = useBuilderStore((s) => s.onConnect);
  const setViewport = useBuilderStore((s) => s.setViewport);
  const viewport = useBuilderStore((s) => s.viewport);
  const setSelectedNode = useBuilderStore((s) => s.setSelectedNode);
  const setSelectedEdge = useBuilderStore((s) => s.setSelectedEdge);
  const setSelectedNote = useBuilderStore((s) => s.setSelectedNote);
  const addNote = useBuilderStore((s) => s.addNote);
  const addNode = useBuilderStore((s) => s.addNode);
  const activeRunId = useBuilderStore((s) => s.activeRunId);

  // Local state
  const canvasRef = useRef<HTMLDivElement>(null);
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);

  // Sync viewport when ReactFlow instance changes (initial load/restore)
  useEffect(() => {
    if (!rfInstance) return;
    rfInstance.setViewport(viewport);
  }, [rfInstance, viewport]);

  // Composed Hooks
  const { displayNodes, displayEdges, steps: _steps, baseEdgeStroke } = useCanvasDisplay(activeRunId);
  const events = useCanvasEvents({ rfInstance, canvasRef });

  // Re-export type compatible return object
  // Note: 'steps' from useRunStepsQuery used to be returned typed as "ReturnType...['steps']".
  // Accessing it via the new hook should work same way.

  return {
    // ReactFlow state
    rfInstance,
    setRfInstance,
    canvasRef,

    // Display data
    displayNodes,
    displayEdges,

    // Builder store state
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    setViewport,
    viewport,
    setSelectedNode,
    setSelectedEdge,
    setSelectedNote,
    addNote,
    addNode,
    activeRunId,

    // Event handlers (spread from useCanvasEvents)
    ...events,

    // Run step data (from display hook)
    steps: _steps,

    // Edge styling
    baseEdgeStroke,
  };
}
