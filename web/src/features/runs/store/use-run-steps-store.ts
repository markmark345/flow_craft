import { create } from "zustand";
import { RunStepDTO } from "@/types/dto";

type State = {
  stepsByRunId: Record<string, RunStepDTO[]>;
  setSteps: (runId: string, steps: RunStepDTO[]) => void;
  upsertStep: (runId: string, step: RunStepDTO) => void;
  clearRunSteps: (runId: string) => void;
};

export const useRunStepsStore = create<State>((set) => ({
  stepsByRunId: {},
  setSteps: (runId, steps) => set((state) => ({ stepsByRunId: { ...state.stepsByRunId, [runId]: steps } })),
  upsertStep: (runId, step) =>
    set((state) => {
      const existing = state.stepsByRunId[runId] || [];
      const next = [...existing.filter((s) => s.id !== step.id), step].sort((a, b) => a.stepKey.localeCompare(b.stepKey));
      return { stepsByRunId: { ...state.stepsByRunId, [runId]: next } };
    }),
  clearRunSteps: (runId) =>
    set((state) => {
      const copy = { ...state.stepsByRunId };
      delete copy[runId];
      return { stepsByRunId: copy };
    }),
}));

