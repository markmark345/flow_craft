
import { StateCreator } from "zustand";
import { useBuilderStore } from "../../../store/use-builder-store";
import { isValidAgentModelConfig } from "../../../types/agent";
import { WizardState, AgentDraft, AgentSlice } from "../types";
import { request } from "@/lib/fetcher";
import { API_BASE_URL } from "@/lib/env";
import { computeCanvasCenterPosition } from "../ui-utils";

export const createAgentSlice: StateCreator<WizardState, [], [], AgentSlice> = (set, get) => ({
  runAgentTest: async () => {
    const { draft } = get();
    const d = draft as AgentDraft;
    const model = d.model;
    if (!model) throw new Error("Missing model configuration");
    const res = await request<{ data: any }>(`${API_BASE_URL}/nodes/test`, {
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
    return res.data;
  },

  confirmAgent: () => {
    const { draft } = get();
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
  }
});
