import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { type ReactFlowInstance, type EdgeChange, MarkerType } from "reactflow";
import { useBuilderStore } from "../store/use-builder-store";
import { useNodeDnd } from "./use-node-dnd";
import { useRunStepsQuery } from "@/features/runs/hooks/use-run-steps";
import { useAppStore } from "@/hooks/use-app-store";
import { useAuthStore } from "@/features/auth/store/use-auth-store";
import { NODE_CATALOG } from "../types/node-catalog";
import type { BuilderNodeType } from "../types";
import { defaultActionKeyForApp, normalizeAppKey } from "../nodeCatalog/catalog";

export interface UseCanvasReturn {
  // ReactFlow state
  rfInstance: ReactFlowInstance | null;
  setRfInstance: (instance: ReactFlowInstance | null) => void;
  canvasRef: React.RefObject<HTMLDivElement>;

  // Display data
  displayNodes: ReturnType<typeof useBuilderStore.getState>["nodes"];
  displayEdges: ReturnType<typeof useBuilderStore.getState>["edges"];

  // Builder store actions
  nodes: ReturnType<typeof useBuilderStore.getState>["nodes"];
  edges: ReturnType<typeof useBuilderStore.getState>["edges"];
  onNodesChange: ReturnType<typeof useBuilderStore.getState>["onNodesChange"];
  onEdgesChange: ReturnType<typeof useBuilderStore.getState>["onEdgesChange"];
  onConnect: ReturnType<typeof useBuilderStore.getState>["onConnect"];
  setViewport: ReturnType<typeof useBuilderStore.getState>["setViewport"];
  viewport: ReturnType<typeof useBuilderStore.getState>["viewport"];
  setSelectedNode: ReturnType<typeof useBuilderStore.getState>["setSelectedNode"];
  setSelectedEdge: ReturnType<typeof useBuilderStore.getState>["setSelectedEdge"];
  setSelectedNote: ReturnType<typeof useBuilderStore.getState>["setSelectedNote"];
  addNote: ReturnType<typeof useBuilderStore.getState>["addNote"];
  addNode: ReturnType<typeof useBuilderStore.getState>["addNode"];
  activeRunId: string | undefined;

  // Event handlers
  deleteEdge: (id: string) => void;
  onDragOver: (event: React.DragEvent) => void;
  onDrop: (event: React.DragEvent) => void;
  onMoveEnd: () => void;
  onPaneClick: (event: React.MouseEvent) => void;
  onNodeClick: (_: React.MouseEvent, node: any) => void;
  onEdgeClick: (_: React.MouseEvent, edge: any) => void;
  onSelectionChange: (sel: { nodes: Array<{ id: string }>; edges: Array<{ id: string }> }) => void;

  // Run step data
  steps: ReturnType<typeof useRunStepsQuery>["steps"];

  // Edge styling
  baseEdgeStroke: string;
}

/**
 * Custom hook for managing Builder Canvas state and logic.
 * Handles ReactFlow instance, node/edge display, drag-and-drop, and run visualization.
 */
export function useCanvas(): UseCanvasReturn {
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

  // App state
  const reduceMotion = useAppStore((s) => s.reduceMotion);
  const user = useAuthStore((s) => s.user);

  // Local state
  const canvasRef = useRef<HTMLDivElement>(null);
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);

  // Hooks
  const { createNodeAt } = useNodeDnd();
  const { steps } = useRunStepsQuery(activeRunId, { pollMs: 800 });

  // Map steps by node ID for quick lookup
  const stepByNodeId = useMemo(() => {
    const map = new Map<string, (typeof steps)[number]>();
    for (const step of steps) {
      if (step.nodeId) map.set(step.nodeId, step);
    }
    return map;
  }, [steps]);

  // Display nodes with runtime status
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

  // Edge styling constant
  const baseEdgeStroke = "color-mix(in srgb, var(--muted) 70%, var(--border))";

  // Display edges with runtime styling
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

  // Event handlers
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

      // Handle sticky note drop
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

      // Handle node drop
      if (!rawType || !(rawType in NODE_CATALOG)) return;
      const type = rawType as BuilderNodeType;
      const bounds = canvasRef.current?.getBoundingClientRect();
      if (!bounds) return;
      const position = rfInstance?.project({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      });
      if (!position) return;

      // Handle app node drop with app-specific data
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

  const onPaneClick = useCallback(
    (event: React.MouseEvent) => {
      const target = event.target as HTMLElement;
      const isCanvasClick = target?.classList.contains("react-flow__pane");
      if (isCanvasClick) {
        setSelectedNode(undefined);
        setSelectedEdge(undefined);
        setSelectedNote(undefined);
      }
    },
    [setSelectedEdge, setSelectedNode, setSelectedNote]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: any) => {
      setSelectedNode(node.id);
      setSelectedEdge(undefined);
      setSelectedNote(undefined);
    },
    [setSelectedEdge, setSelectedNode, setSelectedNote]
  );

  const onEdgeClick = useCallback(
    (_: React.MouseEvent, edge: any) => {
      setSelectedEdge(edge.id);
      setSelectedNode(undefined);
      setSelectedNote(undefined);
    },
    [setSelectedEdge, setSelectedNode, setSelectedNote]
  );

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

  // Sync viewport when ReactFlow instance changes
  useEffect(() => {
    if (!rfInstance) return;
    rfInstance.setViewport(viewport);
  }, [rfInstance, viewport]);

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

    // Event handlers
    deleteEdge,
    onDragOver,
    onDrop,
    onMoveEnd,
    onPaneClick,
    onNodeClick,
    onEdgeClick,
    onSelectionChange,

    // Run step data
    steps,

    // Edge styling
    baseEdgeStroke,
  };
}
