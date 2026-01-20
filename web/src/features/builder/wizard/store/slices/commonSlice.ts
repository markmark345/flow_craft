
import { StateCreator } from "zustand";
import { CommonSlice, WizardState } from "../types";
import { buildDefaultAgentDraft, buildDefaultAppDraft, buildDefaultToolDraft, initialState, stepsForMode } from "../utils";

export const createCommonSlice: StateCreator<WizardState, [], [], CommonSlice> = (set, get) => ({
  ...initialState,
  draft: buildDefaultAppDraft(),
  openAddAppNode: (flowId, presetApp, presetAction) => {
    set({
      isOpen: true,
      mode: "add-app-node",
      flowId,
      stepIndex: 0,
      draft: buildDefaultAppDraft(presetApp, presetAction),
      validationErrors: {},
      testResult: null,
      isTesting: false,
      isSubmitting: false,
    });
  },
  openAddAgent: (flowId) => {
    set({
      isOpen: true,
      mode: "add-agent",
      flowId,
      stepIndex: 0,
      draft: buildDefaultAgentDraft(),
      validationErrors: {},
      testResult: null,
      isTesting: false,
      isSubmitting: false,
    });
  },
  openAddAgentTool: (flowId, agentNodeId) => {
    set({
      isOpen: true,
      mode: "add-agent-tool",
      flowId,
      stepIndex: 0,
      draft: buildDefaultToolDraft(agentNodeId),
      validationErrors: {},
      testResult: null,
      isTesting: false,
      isSubmitting: false,
    });
  },
  close: () => set({ ...initialState, draft: buildDefaultAppDraft() }),
  nextStep: () => {
    const ok = get().validateCurrentStep();
    if (!ok) return;
    const steps = stepsForMode(get().mode);
    const next = Math.min(get().stepIndex + 1, steps.length - 1);
    set({ stepIndex: next, validationErrors: {}, testResult: null });
  },
  prevStep: () => set({ stepIndex: Math.max(get().stepIndex - 1, 0), validationErrors: {}, testResult: null }),
  setDraft: (patch) =>
    set((state) => {
      const current = state.draft;
      const nextConfig =
        patch.config && typeof patch.config === "object" ? { ...(current.config || {}), ...patch.config } : current.config;
      return { draft: { ...current, ...patch, config: nextConfig } };
    }),
  setValidationErrors: (validationErrors) => set({ validationErrors }),
});
