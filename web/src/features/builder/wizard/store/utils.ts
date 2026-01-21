
import { AppKey, APP_CATALOG, defaultActionKeyForApp, findAppAction } from "../../nodeCatalog/catalog";
import { AGENT_TOOL_CATALOG } from "../../nodeCatalog/catalog";
import { NODE_CATALOG } from "../../types/node-catalog";
import { AgentDraft, AgentToolDraft, AppNodeDraft, WizardMode } from "./types";

export function actionLabelFor(app: AppKey | null, action: string | null) {
  if (!app || !action) return "";
  const found = findAppAction(app, action);
  return found?.label || "";
}

export function buildDefaultAgentDraft(): AgentDraft {
  const meta = NODE_CATALOG.aiAgent;
  return {
    label: "AI Agent",
    config: { ...(meta.defaultConfig || {}) },
    model: null,
    memory: null,
    tools: [],
  };
}

export function buildDefaultAppDraft(presetApp?: AppKey, presetAction?: string): AppNodeDraft {
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

export function buildDefaultToolDraft(agentNodeId: string): AgentToolDraft {
  return {
    agentNodeId,
    toolKey: null,
    config: {
      credentialId: "",
    },
  };
}

export function stepsForMode(mode: WizardMode) {
  if (mode === "add-agent") return ["Agent", "Model", "Memory", "Tools", "Review"] as const;
  if (mode === "add-agent-tool") return ["Tool", "Credential", "Configure", "Test", "Review"] as const;
  return ["App", "Action", "Credential", "Configure", "Test", "Review"] as const;
}

export const initialState = {
  isOpen: false,
  mode: "add-app-node" as WizardMode,
  flowId: undefined,
  stepIndex: 0,
  validationErrors: {},
  testResult: null,
  isTesting: false,
  isSubmitting: false,
};
