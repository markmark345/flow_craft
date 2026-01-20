
import type { Edge, Node, Viewport, OnNodesChange, OnEdgesChange, Connection } from "reactflow";
import type { FlowNodeData, SerializedFlow, StickyNote, BuilderNodeType } from "../types";
import type { AuthUser } from "@/lib/auth";

export type AgentInspectorTab = "model" | "memory" | "tools";

export type BuilderState = {
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
};

export type BuilderActions = {
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

export type BuilderStore = BuilderState & BuilderActions;
