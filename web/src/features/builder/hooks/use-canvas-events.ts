
import { useCallback, RefObject } from "react";
import { EdgeChange, ReactFlowInstance, Node, Edge } from "reactflow";
import { useBuilderStore } from "../store/use-builder-store";
import { useNodeDnd } from "./use-node-dnd";
import { useAuthStore } from "@/features/auth/store/use-auth-store";
import { NODE_CATALOG } from "../types/node-catalog";
import { BuilderNodeType } from "../types";
import { defaultActionKeyForApp, normalizeAppKey } from "../nodeCatalog/catalog";

type CanvasEventsProps = {
  rfInstance: ReactFlowInstance | null;
  canvasRef: RefObject<HTMLDivElement>;
};

export function useCanvasEvents({ rfInstance, canvasRef }: CanvasEventsProps) {
  const onEdgesChange = useBuilderStore((s) => s.onEdgesChange);
  const addNote = useBuilderStore((s) => s.addNote);
  const addNode = useBuilderStore((s) => s.addNode);
  const setViewport = useBuilderStore((s) => s.setViewport);
  const setSelectedNode = useBuilderStore((s) => s.setSelectedNode);
  const setSelectedEdge = useBuilderStore((s) => s.setSelectedEdge);
  const setSelectedNote = useBuilderStore((s) => s.setSelectedNote);
  const user = useAuthStore((s) => s.user);

  const { createNodeAt } = useNodeDnd();

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
    [addNode, addNote, createNodeAt, rfInstance, user, canvasRef]
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
    (_: React.MouseEvent, node: Node) => {
      setSelectedNode(node.id);
      setSelectedEdge(undefined);
      setSelectedNote(undefined);
    },
    [setSelectedEdge, setSelectedNode, setSelectedNote]
  );

  const onEdgeClick = useCallback(
    (_: React.MouseEvent, edge: Edge) => {
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

  return {
    deleteEdge,
    onDragOver,
    onDrop,
    onMoveEnd,
    onPaneClick,
    onNodeClick,
    onEdgeClick,
    onSelectionChange,
  };
}
