
import type { StateCreator } from "zustand";
import type { AgentInspectorTab, BuilderStore } from "../types";

export type SelectionSlice = {
  selectedNodeId?: string;
  selectedEdgeId?: string;
  selectedNoteId?: string;
  agentInspectorTab: AgentInspectorTab;
  activeRunId?: string;
  setSelectedNode: (id?: string) => void;
  setSelectedEdge: (id?: string) => void;
  setSelectedNote: (id?: string) => void;
  setAgentInspectorTab: (tab: AgentInspectorTab) => void;
  setActiveRunId: (id?: string) => void;
};

export const createSelectionSlice: StateCreator<BuilderStore, [], [], SelectionSlice> = (set) => ({
  selectedNodeId: undefined,
  selectedEdgeId: undefined,
  selectedNoteId: undefined,
  agentInspectorTab: "model",
  activeRunId: undefined,
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
});
