
import type { Edge, Connection } from "reactflow";
import { applyEdgeChanges, type OnEdgesChange } from "reactflow";
import type { StateCreator } from "zustand";
import type { BuilderStore } from "../types";

export type EdgesSlice = {
  edges: Edge[];
  setEdges: (edges: Edge[]) => void;
  onEdgesChange: OnEdgesChange;
  onConnect: (connection: Connection) => void;
};

export const createEdgesSlice: StateCreator<BuilderStore, [], [], EdgesSlice> = (set, get) => ({
  edges: [],
  setEdges: (edges) => set({ edges, dirty: true }),
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
});
