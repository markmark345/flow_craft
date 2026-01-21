
import { create } from "zustand";
import { applyNodeChanges, type Viewport, type OnNodesChange } from "reactflow";
import type { SerializedFlow, StickyNote } from "../types";
import type { BuilderStore } from "./types";
import { normalizeNode, normalizeNote } from "./utils";
import { createNodesSlice } from "./slices/nodesSlice";
import { createEdgesSlice } from "./slices/edgesSlice";
import { createNotesSlice } from "./slices/notesSlice";
import { createSelectionSlice } from "./slices/selectionSlice";
import { migrateAgentSubnodes } from "../lib/migrate-agent-subnodes";

const initialViewport: Viewport = { x: 0, y: 0, zoom: 1 };

export const useBuilderStore = create<BuilderStore>()((...a) => ({
  // Core state
  flowId: undefined,
  flowName: "Untitled Flow",
  viewport: initialViewport,
  dirty: false,

  // Compose slices
  ...createNodesSlice(...a),
  ...createEdgesSlice(...a),
  ...createNotesSlice(...a),
  ...createSelectionSlice(...a),

  // Core actions
  setFlowId: (id) =>
    a[0]({
      flowId: id,
      activeRunId: undefined,
      selectedNodeId: undefined,
      selectedEdgeId: undefined,
      selectedNoteId: undefined,
    }),
  setFlowName: (name) => a[0]({ flowName: name, dirty: true }),
  setViewport: (viewport) => a[0]({ viewport, dirty: true }),
  markDirty: () => a[0]({ dirty: true }),
  markSaved: () => a[0]({ dirty: false }),

  // React Flow handlers
  onNodesChange: ((changes) =>
    a[0]({
      nodes: applyNodeChanges(changes, a[1]().nodes),
      dirty: true,
    })) as OnNodesChange,

  // Hydration and serialization
  hydrateFromDefinition: (def: SerializedFlow, name?: string) => {
    const normalizedNodes = (def.reactflow?.nodes || []).map(normalizeNode);
    const normalizedEdges = def.reactflow?.edges || [];
    const migrated = migrateAgentSubnodes(normalizedNodes, normalizedEdges);
    a[0]({
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
    const { nodes, edges, viewport, notes, flowId, flowName } = a[1]();
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
}));
