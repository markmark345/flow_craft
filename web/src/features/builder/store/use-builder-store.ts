import { create } from "zustand";
import {
  Edge,
  Node,
  applyEdgeChanges,
  applyNodeChanges,
  Connection,
  Viewport,
  type OnEdgesChange,
  type OnNodesChange,
} from "reactflow";
import { FlowNodeData, SerializedFlow, StickyNote } from "../types";
import { BuilderNodeType } from "../types";
import { NODE_CATALOG, createDefaultNodeData } from "../types/node-catalog";
import type { AuthUser } from "@/shared/lib/auth";
import { migrateAgentSubnodes } from "../lib/migrate-agent-subnodes";

type AgentInspectorTab = "model" | "memory" | "tools";

type State = {
  flowId?: string;
  flowName: string;
  nodes: Node<FlowNodeData>[];
  edges: Edge[];
  viewport: Viewport;
  notes: StickyNote[];
  selectedNodeId?: string;
  selectedEdgeId?: string;
  selectedNoteId?: string;
  agentInspectorTab: AgentInspectorTab;
  activeRunId?: string;
  dirty: boolean;
  setFlowId: (id: string) => void;
  setFlowName: (name: string) => void;
  setNodes: (nodes: Node<FlowNodeData>[]) => void;
  setEdges: (edges: Edge[]) => void;
  setViewport: (viewport: Viewport) => void;
  setNotes: (notes: StickyNote[]) => void;
  setSelectedNode: (id?: string) => void;
  setSelectedEdge: (id?: string) => void;
  setSelectedNote: (id?: string) => void;
  setAgentInspectorTab: (tab: AgentInspectorTab) => void;
  setActiveRunId: (id?: string) => void;
  markDirty: () => void;
  markSaved: () => void;
  hydrateFromDefinition: (def: SerializedFlow, name?: string) => void;
  serializeDefinition: () => SerializedFlow;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: (connection: Connection) => void;
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
  addNote: (position: { x: number; y: number }, actor?: AuthUser) => void;
  updateNote: (id: string, patch: Partial<Omit<StickyNote, "id">>) => void;
  deleteNote: (id: string) => void;
  duplicateNote: (id: string, actor?: AuthUser) => void;
};

const initialViewport: Viewport = { x: 0, y: 0, zoom: 1 };

function normalizeNode(node: Node<any>): Node<FlowNodeData> {
  const data: any = node.data || {};
  const dataNodeType = data?.nodeType;
  const resolved =
    (typeof dataNodeType === "string" && NODE_CATALOG[dataNodeType as BuilderNodeType]
      ? (dataNodeType as BuilderNodeType)
      : undefined) ||
    (NODE_CATALOG[node.type as BuilderNodeType] ? (node.type as BuilderNodeType) : undefined) ||
    "httpRequest";

  const legacyModelProvider = (() => {
    if (resolved === "openaiChatModel") return "openai";
    if (resolved === "geminiChatModel") return "gemini";
    if (resolved === "grokChatModel") return "grok";
    return null;
  })();

  const inferred = legacyModelProvider ? "chatModel" : resolved;

  const defaultLabel =
    legacyModelProvider && typeof data?.label !== "string"
      ? `${legacyModelProvider === "gemini" ? "Gemini" : legacyModelProvider === "grok" ? "Grok" : "OpenAI"} Chat Model`
      : data?.label;

  const defaults = createDefaultNodeData(inferred, defaultLabel);
  return {
    ...node,
    type: "flowNode",
    data: {
      ...defaults,
      ...data,
      nodeType: inferred,
      config: {
        ...(defaults.config || {}),
        ...((data?.config as Record<string, unknown>) || {}),
        ...(legacyModelProvider ? { provider: legacyModelProvider } : {}),
      },
    },
  };
}

function normalizeNote(note: any): StickyNote | null {
  if (!note || typeof note !== "object") return null;
  const id = typeof note.id === "string" && note.id.length ? note.id : crypto.randomUUID();
  const x = typeof note.x === "number" ? note.x : 0;
  const y = typeof note.y === "number" ? note.y : 0;
  const width = typeof note.width === "number" ? note.width : 360;
  const height = typeof note.height === "number" ? note.height : 280;
  const allowedColors: StickyNote["color"][] = ["yellow", "blue", "green"];
  const rawColor = typeof note.color === "string" ? note.color : "";
  let color: StickyNote["color"] = "yellow";
  if (allowedColors.includes(rawColor as StickyNote["color"])) color = rawColor as StickyNote["color"];
  else if (rawColor === "purple") color = "blue";
  else if (rawColor === "pink") color = "yellow";
  const text = typeof note.text === "string" ? note.text : "";
  const collapsed = Boolean(note.collapsed);

  const createdAt = typeof note.createdAt === "string" ? note.createdAt : undefined;
  const updatedAt = typeof note.updatedAt === "string" ? note.updatedAt : undefined;

  const coerceUser = (u: any) => {
    if (!u || typeof u !== "object") return undefined;
    const id = typeof u.id === "string" ? u.id : "";
    const name = typeof u.name === "string" ? u.name : "";
    const email = typeof u.email === "string" ? u.email : "";
    if (!id || !email) return undefined;
    return { id, name, email };
  };

  const createdBy = coerceUser(note.createdBy);
  const updatedBy = coerceUser(note.updatedBy);

  return { id, x, y, width, height, color, text, collapsed, createdAt, createdBy, updatedAt, updatedBy };
}

export const useBuilderStore = create<State>((set, get) => ({
  flowId: undefined,
  flowName: "Untitled Flow",
  nodes: [],
  edges: [],
  viewport: initialViewport,
  notes: [],
  selectedNodeId: undefined,
  selectedEdgeId: undefined,
  selectedNoteId: undefined,
  agentInspectorTab: "model",
  activeRunId: undefined,
  dirty: false,
  setFlowId: (id) =>
    set({
      flowId: id,
      activeRunId: undefined,
      selectedNodeId: undefined,
      selectedEdgeId: undefined,
      selectedNoteId: undefined,
    }),
  setFlowName: (name) => set({ flowName: name, dirty: true }),
  setNodes: (nodes) => set({ nodes, dirty: true }),
  setEdges: (edges) => set({ edges, dirty: true }),
  setViewport: (viewport) => set({ viewport, dirty: true }),
  setNotes: (notes) => set({ notes, dirty: true }),
  setSelectedNode: (id) =>
    set((state) => ({
      selectedNodeId: id,
      selectedEdgeId: id ? undefined : state.selectedEdgeId,
      selectedNoteId: id ? undefined : state.selectedNoteId,
    })),
  setSelectedEdge: (id) =>
    set((state) => ({
      selectedEdgeId: id,
      selectedNodeId: id ? undefined : state.selectedNodeId,
      selectedNoteId: id ? undefined : state.selectedNoteId,
    })),
  setSelectedNote: (id) =>
    set((state) => {
      if (!id) return { selectedNoteId: undefined };
      return {
        selectedNoteId: id,
        selectedNodeId: undefined,
        selectedEdgeId: undefined,
        nodes: state.nodes.map((n) => (n.selected ? { ...n, selected: false } : n)),
        edges: state.edges.map((e) => (e.selected ? { ...e, selected: false } : e)),
      };
    }),
  setAgentInspectorTab: (tab) => set({ agentInspectorTab: tab }),
  setActiveRunId: (id) => set({ activeRunId: id }),
  markDirty: () => set({ dirty: true }),
  markSaved: () => set({ dirty: false }),
  hydrateFromDefinition: (def, name) => {
    const normalizedNodes = (def.reactflow?.nodes || []).map(normalizeNode);
    const normalizedEdges = def.reactflow?.edges || [];
    const migrated = migrateAgentSubnodes(normalizedNodes, normalizedEdges);
    set({
      flowName: name || def.name || "Untitled Flow",
      nodes: migrated.nodes,
      edges: migrated.edges,
      viewport: def.reactflow?.viewport || initialViewport,
      notes: (def.notes || []).map(normalizeNote).filter(Boolean) as StickyNote[],
      activeRunId: undefined,
      selectedNodeId: undefined,
      selectedEdgeId: undefined,
      selectedNoteId: undefined,
      dirty: migrated.didMigrate,
    });
  },
  serializeDefinition: () => {
    const { nodes, edges, viewport, notes, flowId, flowName } = get();
    return {
      id: flowId || "",
      name: flowName,
      version: 1,
      reactflow: {
        nodes,
        edges,
        viewport,
      },
      notes,
    };
  },
  onNodesChange: (changes) =>
    set({
      nodes: applyNodeChanges(changes, get().nodes),
      dirty: true,
    }),
  onEdgesChange: (changes) =>
    set((state) => {
      const nextEdges = applyEdgeChanges(changes, state.edges);
      const selectedEdgeStillExists = state.selectedEdgeId
        ? nextEdges.some((e) => e.id === state.selectedEdgeId)
        : true;
      return {
        edges: nextEdges,
        selectedEdgeId: selectedEdgeStillExists ? state.selectedEdgeId : undefined,
        dirty: true,
      };
    }),
  onConnect: (connection) =>
    set((state) => {
      if (!connection.source || !connection.target) return { dirty: true };
      return {
        edges: [
          ...state.edges,
          {
            id: crypto.randomUUID(),
            source: connection.source,
            target: connection.target,
            sourceHandle: connection.sourceHandle,
            targetHandle: connection.targetHandle,
          },
        ],
        dirty: true,
      };
    }),
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
  addNote: (position, actor) => {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const note: StickyNote = {
      id,
      x: position.x,
      y: position.y,
      width: 360,
      height: 280,
      color: "yellow",
      text: "",
      collapsed: false,
      createdAt: actor ? now : undefined,
      createdBy: actor ? { id: actor.id, name: actor.name, email: actor.email } : undefined,
      updatedAt: actor ? now : undefined,
      updatedBy: actor ? { id: actor.id, name: actor.name, email: actor.email } : undefined,
    };
    set((state) => ({
      notes: [...state.notes, note],
      selectedNoteId: id,
      selectedNodeId: undefined,
      selectedEdgeId: undefined,
      dirty: true,
    }));
  },
  updateNote: (id, patch) =>
    set((state) => ({
      notes: state.notes.map((n) => (n.id === id ? { ...n, ...patch } : n)),
      dirty: true,
    })),
  deleteNote: (id) =>
    set((state) => ({
      notes: state.notes.filter((n) => n.id !== id),
      selectedNoteId: state.selectedNoteId === id ? undefined : state.selectedNoteId,
      dirty: true,
    })),
  duplicateNote: (id, actor) => {
    const src = get().notes.find((n) => n.id === id);
    if (!src) return;
    const newId = crypto.randomUUID();
    const now = new Date().toISOString();
    const copy: StickyNote = {
      ...src,
      id: newId,
      x: src.x + 30,
      y: src.y + 30,
      collapsed: false,
      createdAt: actor ? now : src.createdAt,
      createdBy: actor ? { id: actor.id, name: actor.name, email: actor.email } : src.createdBy,
      updatedAt: actor ? now : src.updatedAt,
      updatedBy: actor ? { id: actor.id, name: actor.name, email: actor.email } : src.updatedBy,
    };
    set((state) => ({
      notes: [...state.notes, copy],
      selectedNoteId: newId,
      selectedNodeId: undefined,
      selectedEdgeId: undefined,
      dirty: true,
    }));
  },
}));
