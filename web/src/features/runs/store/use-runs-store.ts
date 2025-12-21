import { create } from "zustand";
import { RunDTO } from "@/shared/types/dto";

type State = {
  items: RunDTO[];
  setRuns: (runs: RunDTO[]) => void;
  addRun: (run: RunDTO) => void;
  upsertRun: (run: RunDTO) => void;
};

export const useRunsStore = create<State>((set) => ({
  items: [],
  setRuns: (runs) => set({ items: runs }),
  addRun: (run) => set((state) => ({ items: [...state.items, run] })),
  upsertRun: (run) =>
    set((state) => ({ items: [...state.items.filter((r) => r.id !== run.id), run] })),
}));
