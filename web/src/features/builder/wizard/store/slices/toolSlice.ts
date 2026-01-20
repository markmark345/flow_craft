
import { StateCreator } from "zustand";
import { useBuilderStore } from "../../../store/use-builder-store";
import { AGENT_TOOL_CATALOG } from "../../../nodeCatalog/catalog";
import { AgentToolConfig } from "../../../types/agent";
import { AgentToolDraft, WizardState, ToolSlice } from "../types";
import { request } from "@/lib/fetcher";
import { API_BASE_URL } from "@/lib/env";

export const createToolSlice: StateCreator<WizardState, [], [], ToolSlice> = (set, get) => ({
  runToolTest: async () => {
    const { draft } = get();
    const d = draft as AgentToolDraft;
    const tool = AGENT_TOOL_CATALOG.find((t) => t.toolKey === d.toolKey);
    if (!tool) throw new Error("Choose a tool first");
    const res = await request<{ data: any }>(`${API_BASE_URL}/nodes/test`, {
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
    return res.data;
  },

  confirmTool: () => {
    const { draft } = get();
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
  }
});
