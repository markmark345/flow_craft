"use client";

import { create } from "zustand";

import { request } from "@/lib/fetcher";
import { useAppStore } from "@/hooks/use-app-store";
import { API_BASE_URL } from "@/lib/env";

import { useBuilderStore } from "../../store/use-builder-store";
import { NODE_CATALOG } from "../../types/node-catalog";
import { AGENT_TOOL_CATALOG, APP_CATALOG, defaultActionKeyForApp, findAppAction, type AppKey } from "../../nodeCatalog/catalog";
import { isValidAgentModelConfig, type AgentMemoryConfig, type AgentModelConfig, type AgentToolConfig } from "../../types/agent";

export type WizardMode = "add-app-node" | "add-agent" | "add-agent-tool";

export type WizardTestResult = {
  success: boolean;
  message: string;
  preview?: unknown;
  output?: unknown;
};

type BaseState = {
  isOpen: boolean;
  mode: WizardMode;
  flowId?: string;
  stepIndex: number;
  validationErrors: Record<string, string>;
  testResult: WizardTestResult | null;
  isTesting: boolean;
  isSubmitting: boolean;
};

export type AppNodeDraft = {
  label: string;
  app: AppKey | null;
  action: string | null;
  config: Record<string, unknown>;
};

export type AgentDraft = {
  label: string;
  config: Record<string, unknown>;
  model: AgentModelConfig | null;
  memory: AgentMemoryConfig | null;
  tools: AgentToolConfig[];
};

export type AgentToolDraft = {
  agentNodeId: string;
  toolKey: string | null;
  config: Record<string, unknown>;
};

type Draft = AppNodeDraft | AgentDraft | AgentToolDraft;

type State = BaseState & {
  draft: Draft;
  openAddAppNode: (flowId: string, presetApp?: AppKey, presetAction?: string) => void;
  openAddAgent: (flowId: string) => void;
  openAddAgentTool: (flowId: string, agentNodeId: string) => void;
  close: () => void;
  nextStep: () => void;
  prevStep: () => void;
  setDraft: (patch: Partial<Draft> & { config?: Record<string, unknown> }) => void;
  setValidationErrors: (errors: Record<string, string>) => void;
  validateCurrentStep: () => boolean;
  runTest: () => Promise<void>;
  confirm: () => Promise<void>;
};

const initialState: BaseState = {
  isOpen: false,
  mode: "add-app-node",
  flowId: undefined,
  stepIndex: 0,
  validationErrors: {},
  testResult: null,
  isTesting: false,
  isSubmitting: false,
};

function computeCanvasCenterPosition() {
  const viewport = useBuilderStore.getState().viewport;
  const zoom = viewport?.zoom || 1;
  if (typeof document === "undefined") return { x: 0, y: 0 };
  const el = document.querySelector<HTMLElement>(".fc-canvas");
  if (!el) return { x: 0, y: 0 };
  const rect = el.getBoundingClientRect();
  const screenX = rect.width / 2;
  const screenY = rect.height / 2;
  return {
    x: (screenX - (viewport?.x || 0)) / zoom,
    y: (screenY - (viewport?.y || 0)) / zoom,
  };
}

function validateRequiredString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0;
}

function validateSchema(schema: Array<{ key: string; label: string; required?: boolean }>, config: Record<string, unknown>) {
  const errors: Record<string, string> = {};
  for (const field of schema) {
    if (!field.required) continue;
    if (!validateRequiredString(config[field.key])) errors[field.key] = `${field.label} is required`;
  }
  return errors;
}

function validateCredentialRequirement(app: AppKey, config: Record<string, unknown>) {
  const credentialId = typeof config.credentialId === "string" ? config.credentialId.trim() : "";
  const apiKey = typeof (config as any).apiKey === "string" ? String((config as any).apiKey).trim() : "";
  if (app === "bannerbear") {
    if (!credentialId && !apiKey) return { credentialId: "Select a credential or provide an API key" };
    return {};
  }
  if (!credentialId) return { credentialId: "Credential is required" };
  return {};
}

function actionLabelFor(app: AppKey | null, action: string | null) {
  if (!app || !action) return "";
  const found = findAppAction(app, action);
  return found?.label || "";
}

function buildDefaultAgentDraft(): AgentDraft {
  const meta = NODE_CATALOG.aiAgent;
  return {
    label: "AI Agent",
    config: { ...(meta.defaultConfig || {}) },
    model: null,
    memory: null,
    tools: [],
  };
}

function buildDefaultAppDraft(presetApp?: AppKey, presetAction?: string): AppNodeDraft {
  const app = presetApp && APP_CATALOG[presetApp] ? presetApp : null;
  const preferredAction = typeof presetAction === "string" ? presetAction.trim() : "";
  const action = app ? preferredAction || defaultActionKeyForApp(app) || null : null;
  const label = actionLabelFor(app, action) || "Action in an app";
  return {
    label,
    app,
    action,
    config: {
      app: app ?? undefined,
      action: action ?? undefined,
      credentialId: "",
    },
  };
}

function buildDefaultToolDraft(agentNodeId: string): AgentToolDraft {
  return {
    agentNodeId,
    toolKey: null,
    config: {
      credentialId: "",
    },
  };
}

function stepsForMode(mode: WizardMode) {
  if (mode === "add-agent") return ["Agent", "Model", "Memory", "Tools", "Review"] as const;
  if (mode === "add-agent-tool") return ["Tool", "Credential", "Configure", "Test", "Review"] as const;
  return ["App", "Action", "Credential", "Configure", "Test", "Review"] as const;
}

export const useWizardStore = create<State>((set, get) => ({
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
      const current = state.draft as any;
      const nextConfig =
        patch.config && typeof patch.config === "object" ? { ...(current.config || {}), ...patch.config } : current.config;
      return { draft: { ...current, ...patch, config: nextConfig } as Draft };
    }),
  setValidationErrors: (validationErrors) => set({ validationErrors }),
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
        const provider = typeof (d.model as any)?.provider === "string" ? String((d.model as any).provider) : "";
        const modelName = typeof (d.model as any)?.model === "string" ? String((d.model as any).model) : "";
        const credentialId = typeof (d.model as any)?.credentialId === "string" ? String((d.model as any).credentialId) : "";
        const apiKeyOverride = typeof (d.model as any)?.apiKeyOverride === "string" ? String((d.model as any).apiKeyOverride) : "";
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
    const { mode, draft } = get();
    set({ isTesting: true, testResult: null });
    try {
      if (mode === "add-agent") {
        const d = draft as AgentDraft;
        const model = d.model;
        if (!model) throw new Error("Missing model configuration");
        const res = await request<{ data: WizardTestResult }>(`${API_BASE_URL}/nodes/test`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            kind: "agent-model",
            provider: model.provider,
            credentialId: model.credentialId || undefined,
            apiKeyOverride: model.apiKeyOverride || undefined,
            baseUrl: model.baseUrl || undefined,
            model: model.model,
          }),
          timeoutMs: 20_000,
        });
        set({ testResult: res.data });
        if (res.data.success) useAppStore.getState().showSuccess("Test succeeded", res.data.message);
        else useAppStore.getState().showError("Test failed", res.data.message);
        return;
      }

      if (mode === "add-app-node") {
        const d = draft as AppNodeDraft;
        if (!d.app || !d.action) throw new Error("Select an app and action first");
        const provider = d.app;
        const res = await request<{ data: WizardTestResult }>(`${API_BASE_URL}/nodes/test`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            kind: "app-action",
            provider,
            action: d.action,
            credentialId: d.config.credentialId,
            config: d.config,
          }),
          timeoutMs: 20_000,
        });
        set({ testResult: res.data });
        if (res.data.success) useAppStore.getState().showSuccess("Test succeeded", res.data.message);
        else useAppStore.getState().showError("Test failed", res.data.message);
        return;
      }

      if (mode === "add-agent-tool") {
        const d = draft as AgentToolDraft;
        const tool = AGENT_TOOL_CATALOG.find((t) => t.toolKey === d.toolKey);
        if (!tool) throw new Error("Choose a tool first");
        const res = await request<{ data: WizardTestResult }>(`${API_BASE_URL}/nodes/test`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            kind: "agent-tool",
            provider: tool.app,
            action: tool.actionKey,
            credentialId: d.config.credentialId,
            config: d.config,
          }),
          timeoutMs: 20_000,
        });
        set({ testResult: res.data });
        if (res.data.success) useAppStore.getState().showSuccess("Test succeeded", res.data.message);
        else useAppStore.getState().showError("Test failed", res.data.message);
        return;
      }
    } catch (err: any) {
      const message = err?.message || "Test failed";
      set({ testResult: { success: false, message } });
      useAppStore.getState().showError("Test failed", message);
    } finally {
      set({ isTesting: false });
    }
  },
  confirm: async () => {
    set({ isSubmitting: true });
    try {
      const { mode, draft } = get();
      const flowId = get().flowId;
      if (!flowId) throw new Error("Missing flowId");

      if (mode === "add-app-node") {
        const d = draft as AppNodeDraft;
        if (!d.app || !d.action) throw new Error("Missing app/action");
        const pos = computeCanvasCenterPosition();
        const addNode = useBuilderStore.getState().addNode;
        addNode("app", pos, d.label);
        const nodeId = useBuilderStore.getState().selectedNodeId;
        if (!nodeId) return;
        useBuilderStore.getState().updateNodeConfig(nodeId, {
          ...d.config,
          app: d.app,
          action: d.action,
        });
        useAppStore.getState().showSuccess("Node added", d.label);
        get().close();
        return;
      }

      if (mode === "add-agent") {
        const d = draft as AgentDraft;
        const pos = computeCanvasCenterPosition();
        const addNode = useBuilderStore.getState().addNode;
        addNode("aiAgent", pos, d.label);
        const nodeId = useBuilderStore.getState().selectedNodeId;
        if (!nodeId) return;
        useBuilderStore.getState().updateNodeData(nodeId, {
          label: d.label,
          config: d.config,
          model: d.model,
          memory: d.memory,
          tools: d.tools,
        });
        useAppStore.getState().showSuccess("Agent added", d.label);
        get().close();
        return;
      }

      if (mode === "add-agent-tool") {
        const d = draft as AgentToolDraft;
        const agentNodeId = d.agentNodeId;
        const toolKey = d.toolKey;
        if (!toolKey) throw new Error("Missing tool selection");
        const node = useBuilderStore.getState().nodes.find((n) => n.id === agentNodeId);
        if (!node || node.data.nodeType !== "aiAgent") throw new Error("Agent not found");
        const tool: AgentToolConfig = {
          id: crypto.randomUUID(),
          toolKey,
          enabled: true,
          credentialId: typeof d.config.credentialId === "string" ? String(d.config.credentialId).trim() || undefined : undefined,
          config: { ...d.config },
        };
        const nextTools = [...(node.data.tools || []), tool];
        useBuilderStore.getState().updateNodeData(agentNodeId, { tools: nextTools });
        useAppStore.getState().showSuccess("Tool added", toolKey);
        get().close();
      }
    } catch (err: any) {
      useAppStore.getState().showError("Wizard error", err?.message || "Failed to add node");
    } finally {
      set({ isSubmitting: false });
    }
  },
}));
