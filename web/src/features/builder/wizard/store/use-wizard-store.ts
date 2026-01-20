"use client";

import { create } from "zustand";

import { useAppStore } from "@/hooks/use-app-store";
import { AGENT_TOOL_CATALOG, findAppAction } from "../../nodeCatalog/catalog";
import { isValidAgentModelConfig } from "../../types/agent";

import { WizardState, AppNodeDraft, AgentDraft, AgentToolDraft } from "./types";
import { createCommonSlice } from "./slices/commonSlice";
import { createAppSlice } from "./slices/appSlice";
import { createAgentSlice } from "./slices/agentSlice";
import { createToolSlice } from "./slices/toolSlice";
import { stepsForMode } from "./utils";
import { validateCredentialRequirement, validateRequiredString, validateSchema } from "./validation";

export type { AppNodeDraft, AgentDraft, AgentToolDraft };

// We need to stitch the slices together.
// Since we defined the slices to return parts of the state or actions, we need to manually compose them or adjust the types.
// However, the `createSlice` approach usually involves a combined State type and passing `set` and `get`.
// My previous slice creation was: `export const createCommonSlice: StateCreator<WizardState> = ...`
// This assumes the slice returns Part of WizardState.

// Let's redefine the store creation.

export const useWizardStore = create<WizardState>((set, get) => {
  const common = createCommonSlice(set, get, {} as any);
  // The logic inside slices (like runAppTest) needs access to `get()`, which is passed.
  // But wait, the slices I defined return ONLY the specific methods/state for that slice.
  // But `WizardState` is the union of all.
  // So I can just spread them.
  
  // Actually, I defined specific methods in `appSlice` like `runAppTest` which are NOT in `WizardState`.
  // `WizardState` has `runTest`, `confirm`.
  // So I need to implement `runTest` and `confirm` here by delegating to the slice methods.
  // Or I should have added `runAppTest` to the interface if I wanted to use it directly, but `useWizardStore` consumers expect `runTest`.
  
  // So, let's look at `runTest` implementation in `use-wizard-store.ts`.
  // It dispatches based on `mode`.
  
  // No explicit type assertion needed if StateCreator generics match
  const appSlice = createAppSlice(set, get, {} as any);
  const agentSlice = createAgentSlice(set, get, {} as any);
  const toolSlice = createToolSlice(set, get, {} as any);

  // appSlice is typed as AppSlice, so no need for 'as any' to access its members if they are in AppSlice interface
  // However, createAppSlice returns the defined Slice, which is AppSlice.
  const appActions = appSlice;
  const agentActions = agentSlice;
  const toolActions = toolSlice;

  return {
    ...common,
    ...appSlice,
    ...agentSlice,
    ...toolSlice,
    
    validateCurrentStep: () => {
      const { mode, stepIndex, draft } = get();
      const steps = stepsForMode(mode);
      const step = steps[stepIndex];
      const errors: Record<string, string> = {};

      if (mode === "add-app-node") {
        const d = draft as AppNodeDraft;
        const app = d.app;
        const action = d.action;
        if (step === "App") {
          if (!app) errors.app = "Choose an app";
        } else if (step === "Action") {
          if (!app) errors.app = "Choose an app first";
          if (!action) errors.action = "Choose an action";
        } else if (step === "Credential") {
          if (!app) errors.app = "Choose an app first";
          Object.assign(errors, app ? validateCredentialRequirement(app, d.config) : {});
        } else if (step === "Configure") {
          if (!app || !action) {
            errors.action = "Choose an action first";
          } else {
            const actionDef = findAppAction(app, action);
            Object.assign(errors, validateSchema(actionDef?.fields || [], d.config));
          }
        }
      }

      if (mode === "add-agent") {
        const d = draft as AgentDraft;
        if (step === "Agent") {
          if (!validateRequiredString(d.label)) errors.label = "Label is required";
        } else if (step === "Model") {
          if (!d.model) errors.model = "Model is required";
          const provider = d.model?.provider || "";
          const modelName = d.model?.model || "";
          const credentialId = d.model?.credentialId || "";
          const apiKeyOverride = d.model?.apiKeyOverride || "";
          
          if (!provider.trim()) errors.provider = "Provider is required";
          if (!modelName.trim()) errors.modelName = "Model name is required";
          if (!credentialId.trim() && !apiKeyOverride.trim()) errors.credentialId = "Credential or API key is required";
          if (d.model && !isValidAgentModelConfig(d.model)) errors.model = "Missing model configuration";
        }
      }

      if (mode === "add-agent-tool") {
        const d = draft as AgentToolDraft;
        if (step === "Tool") {
          if (!d.toolKey) errors.toolKey = "Choose a tool";
        } else if (step === "Credential") {
          const tool = AGENT_TOOL_CATALOG.find((t) => t.toolKey === d.toolKey);
          if (!tool) errors.toolKey = "Choose a tool first";
          if (tool) Object.assign(errors, validateCredentialRequirement(tool.app, d.config));
        } else if (step === "Configure") {
          const tool = AGENT_TOOL_CATALOG.find((t) => t.toolKey === d.toolKey);
          if (!tool) errors.toolKey = "Choose a tool first";
          if (tool) Object.assign(errors, validateSchema(tool.fields || [], d.config));
        }
      }

      set({ validationErrors: errors });
      return Object.keys(errors).length === 0;
    },

    runTest: async () => {
      const { mode } = get();
      set({ isTesting: true, testResult: null });
      try {
        let result = null;
        if (mode === "add-app-node") {
          result = await appActions.runAppTest();
        } else if (mode === "add-agent") {
          result = await agentActions.runAgentTest();
        } else if (mode === "add-agent-tool") {
          result = await toolActions.runToolTest();
        }

        if (result) {
          set({ testResult: result });
          if (result.success) useAppStore.getState().showSuccess("Test succeeded", result.message);
          else useAppStore.getState().showError("Test failed", result.message);
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Test failed";
        set({ testResult: { success: false, message } });
        useAppStore.getState().showError("Test failed", message);
      } finally {
        set({ isTesting: false });
      }
    },

    confirm: async () => {
      set({ isSubmitting: true });
      try {
        const { mode, flowId } = get();
        if (!flowId) throw new Error("Missing flowId");

        if (mode === "add-app-node") {
          appActions.confirmAppNode();
          useAppStore.getState().showSuccess("Node added", (get().draft as AppNodeDraft).label);
        } else if (mode === "add-agent") {
           agentActions.confirmAgent();
           useAppStore.getState().showSuccess("Agent added", (get().draft as AgentDraft).label);
        } else if (mode === "add-agent-tool") {
           toolActions.confirmTool();
           useAppStore.getState().showSuccess("Tool added", (get().draft as AgentToolDraft).toolKey || "Tool");
        }
        get().close();
      } catch (err: unknown) {
        useAppStore.getState().showError("Wizard error", err instanceof Error ? err.message : "Failed to add node");
      } finally {
        set({ isSubmitting: false });
      }
    },
  };
});
