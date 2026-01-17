import { create } from "zustand";
import { FlowDTO } from "@/types/dto";

type State = {
  items: FlowDTO[];
  setFlows: (flows: FlowDTO[]) => void;
  addFlow: (flow: FlowDTO) => void;
  upsertFlow: (flow: FlowDTO) => void;
  removeFlow: (id: string) => void;
};

export const useFlowsStore = create<State>((set) => ({
  items: [],
  setFlows: (flows) => set({ items: flows }),
  addFlow: (flow) => set((state) => ({ items: [...state.items, flow] })),
  upsertFlow: (flow) =>
    set((state) => ({ items: [...state.items.filter((f) => f.id !== flow.id), flow] })),
  removeFlow: (id) => set((state) => ({ items: state.items.filter((f) => f.id !== id) })),
}));
