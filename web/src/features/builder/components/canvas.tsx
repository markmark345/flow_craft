"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactFlow, {
  Background,
  MiniMap,
  ReactFlowInstance,
  BackgroundVariant,
  MarkerType,
  type EdgeChange,
} from "reactflow";
import "reactflow/dist/style.css";
import { useBuilderStore } from "../store/use-builder-store";
import { BuilderTopbar } from "./builder-topbar";
import { NodePalette } from "./node-palette";
import { Inspector } from "./inspector";
import { LogsDrawer } from "./logs-drawer";
import { useNodeDnd } from "../hooks/use-node-dnd";
import { FlowNode } from "./flow-node";
import { NODE_CATALOG } from "../types/node-catalog";
import { BuilderNodeType } from "../types";
import { Icon } from "@/shared/components/icon";
import { useRunStepsQuery } from "@/features/runs/hooks/use-run-steps";
import { useAppStore } from "@/shared/hooks/use-app-store";
import { StickyNotesLayer } from "./sticky-notes-layer";
import { useAuthStore } from "@/features/auth/store/use-auth-store";
import { WizardModal } from "../wizard/components/wizard-modal";
import { defaultActionKeyForApp, normalizeAppKey } from "../nodeCatalog/catalog";

export function BuilderCanvas() {
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
  const reduceMotion = useAppStore((s) => s.reduceMotion);
  const user = useAuthStore((s) => s.user);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);
  const { createNodeAt } = useNodeDnd();
  const { steps } = useRunStepsQuery(activeRunId, { pollMs: 800 });

  const stepByNodeId = useMemo(() => {
    const map = new Map<string, (typeof steps)[number]>();
    for (const step of steps) {
      if (step.nodeId) map.set(step.nodeId, step);
    }
    return map;
  }, [steps]);

  const displayNodes = useMemo(() => {
    if (!activeRunId) return nodes;
    return nodes.map((node) => {
      const step = stepByNodeId.get(node.id);
      if (!step) return node;
      return {
        ...node,
        data: {
          ...node.data,
          runtimeStatus: step.status,
          runtimeStepKey: step.stepKey,
          runtimePulse: !reduceMotion,
        },
      };
    });
  }, [activeRunId, nodes, reduceMotion, stepByNodeId]);

  const baseEdgeStroke = "color-mix(in srgb, var(--muted) 70%, var(--border))";

  const displayEdges = useMemo(() => {
    return edges.map((edge) => {
      const sourceStatus = activeRunId ? stepByNodeId.get(edge.source)?.status : undefined;
      const targetStatus = activeRunId ? stepByNodeId.get(edge.target)?.status : undefined;

      const anyRunning = sourceStatus === "running" || targetStatus === "running";
      const animateRunning = Boolean(activeRunId && !reduceMotion && anyRunning);
      const anyFailed = sourceStatus === "failed" || targetStatus === "failed";
      const anyCanceled = sourceStatus === "canceled" || targetStatus === "canceled";
      const completed = sourceStatus === "success" && targetStatus === "success";

      let stroke = baseEdgeStroke;
      if (activeRunId) {
        if (anyFailed) stroke = "var(--error)";
        else if (anyRunning) stroke = "var(--accent)";
        else if (completed) stroke = "var(--success)";
        else if (anyCanceled) stroke = "var(--muted)";
      }

      const selected = Boolean(edge.selected);
      if (selected) {
        stroke = `color-mix(in srgb, var(--accent-strong) 65%, ${stroke})`;
      }

      const strokeWidth = selected ? 4 : anyRunning || anyFailed || completed ? 3 : 2.5;

      return {
        ...edge,
        animated: activeRunId ? animateRunning : edge.animated,
        zIndex: selected ? 1000 : edge.zIndex,
        style: {
          ...(edge.style || {}),
          stroke,
          strokeWidth,
          opacity: selected ? 1 : 0.95,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 14,
          height: 14,
          color: stroke,
        },
        interactionWidth: 24,
      };
    });
  }, [activeRunId, baseEdgeStroke, edges, reduceMotion, stepByNodeId]);

  const deleteEdge = useCallback(
    (id: string) => {
      onEdgesChange([{ id, type: "remove" } as EdgeChange]);
    },
    [onEdgesChange]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const rawType = event.dataTransfer.getData("application/reactflow/node-type");
      const label = event.dataTransfer.getData("application/reactflow/node-label") || rawType;
      if (rawType === "stickyNote") {
        const bounds = canvasRef.current?.getBoundingClientRect();
        if (!bounds) return;
        const position = rfInstance?.project({
          x: event.clientX - bounds.left,
          y: event.clientY - bounds.top,
        });
        if (!position) return;
        addNote(position, user);
        return;
      }
      if (!rawType || !(rawType in NODE_CATALOG)) return;
      const type = rawType as BuilderNodeType;
      const bounds = canvasRef.current?.getBoundingClientRect();
      if (!bounds) return;
      const position = rfInstance?.project({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      });
      if (!position) return;

      if (type === "app") {
        const appKey = normalizeAppKey(event.dataTransfer.getData("application/flowcraft/app-key"));
        if (appKey) {
          const actionKey = defaultActionKeyForApp(appKey);
          addNode(type, position, label, { app: appKey, ...(actionKey ? { action: actionKey } : {}) });
          return;
        }
      }
      createNodeAt(type, label, position);
    },
    [addNode, addNote, createNodeAt, rfInstance, user]
  );

  const onMoveEnd = useCallback(() => {
    if (!rfInstance) return;
    const vp = rfInstance.getViewport();
    setViewport(vp);
  }, [rfInstance, setViewport]);

  useEffect(() => {
    if (!rfInstance) return;
    rfInstance.setViewport(viewport);
  }, [rfInstance, viewport]);

  const onSelectionChange = useCallback(
    (sel: { nodes: Array<{ id: string }>; edges: Array<{ id: string }> }) => {
      const edgeId = sel.edges?.[0]?.id;
      if (edgeId) {
        setSelectedEdge(edgeId);
        return;
      }

      const nodeId = sel.nodes?.[0]?.id;
      if (nodeId) {
        setSelectedNode(nodeId);
        return;
      }

      setSelectedNode(undefined);
      setSelectedEdge(undefined);
    },
    [setSelectedEdge, setSelectedNode]
  );

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
