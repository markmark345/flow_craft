
import type { Node } from "reactflow";
import type { StateCreator } from "zustand";
import type { FlowNodeData, BuilderNodeType } from "../../types";
import type { BuilderStore } from "../types";
import { createDefaultNodeData } from "../../types/node-catalog-utils";

export type NodesSlice = {
  nodes: Node<FlowNodeData>[];
  setNodes: (nodes: Node<FlowNodeData>[]) => void;
  addNode: (
    nodeType: BuilderNodeType,
    position: { x: number; y: number },
    label?: string,
    configPatch?: Record<string, unknown>
  ) => void;
  addConnectedNode: (
    fromNodeId: string,
    nodeType: BuilderNodeType,
    opts?: { sourceHandle?: string; offsetX?: number; offsetY?: number; label?: string }
  ) => void;
  duplicateNode: (id: string) => void;
  updateNodeData: (id: string, patch: Partial<FlowNodeData>) => void;
  updateNodeConfig: (id: string, patch: Record<string, unknown>) => void;
  deleteNode: (id: string) => void;
};

export const createNodesSlice: StateCreator<BuilderStore, [], [], NodesSlice> = (set, get) => ({
  nodes: [],
  setNodes: (nodes) => set({ nodes, dirty: true }),
  addNode: (nodeType, position, label, configPatch) => {
    const id = crypto.randomUUID();
    const baseData = createDefaultNodeData(nodeType, label);
    const data = configPatch
      ? { ...baseData, config: { ...(baseData.config || {}), ...configPatch } }
      : baseData;
    set((state) => ({
      nodes: [
        ...state.nodes,
        {
          id,
          type: "flowNode",
          position,
          data,
        },
      ],
      selectedNodeId: id,
      selectedEdgeId: undefined,
      dirty: true,
    }));
  },
  addConnectedNode: (fromNodeId, nodeType, opts) => {
    const source = get().nodes.find((n) => n.id === fromNodeId);
    const id = crypto.randomUUID();
    const base = source?.position || { x: 0, y: 0 };
    const position = {
      x: base.x + (opts?.offsetX ?? 360),
      y: base.y + (opts?.offsetY ?? 0),
    };
    const newNode: Node<FlowNodeData> = {
      id,
      type: "flowNode",
      position,
      data: createDefaultNodeData(nodeType, opts?.label),
    };

    set((state) => ({
      nodes: [...state.nodes, newNode],
      edges: source
        ? [
            ...state.edges,
            {
              id: crypto.randomUUID(),
              source: fromNodeId,
              target: id,
              sourceHandle: opts?.sourceHandle,
            },
          ]
        : state.edges,
      selectedNodeId: id,
      selectedEdgeId: undefined,
      dirty: true,
    }));
  },
  duplicateNode: (id) => {
    const src = get().nodes.find((n) => n.id === id);
    if (!src) return;
    const newId = crypto.randomUUID();
    const copy: Node<FlowNodeData> = {
      ...src,
      id: newId,
      position: { x: src.position.x + 40, y: src.position.y + 40 },
      data: {
        ...src.data,
        label: `${src.data.label} copy`,
        config: { ...(src.data.config || {}) },
      },
      selected: false,
    };

    set((state) => ({
      nodes: [...state.nodes, copy],
      selectedNodeId: newId,
      selectedEdgeId: undefined,
      dirty: true,
    }));
  },
  updateNodeData: (id, patch) =>
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === id
          ? {
              ...n,
              data: {
                ...n.data,
                ...patch,
                config:
                  patch.config && typeof patch.config === "object"
                    ? { ...(n.data.config || {}), ...(patch.config as Record<string, unknown>) }
                    : n.data.config,
              },
            }
          : n
      ),
      dirty: true,
    })),
  updateNodeConfig: (id, patch) =>
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === id
          ? { ...n, data: { ...n.data, config: { ...(n.data.config || {}), ...patch } } }
          : n
      ),
      dirty: true,
    })),
  deleteNode: (id) =>
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== id),
      edges: state.edges.filter((e) => e.source !== id && e.target !== id),
      selectedNodeId: state.selectedNodeId === id ? undefined : state.selectedNodeId,
      selectedEdgeId: undefined,
      dirty: true,
    })),
});
