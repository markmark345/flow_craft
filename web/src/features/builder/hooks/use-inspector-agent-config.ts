import { useMemo } from "react";
import type { Node } from "reactflow";
import type { SelectOption } from "@/shared/components/select";
import type { SchemaField } from "@/shared/components/SchemaForm/types";
import { useCredentialOptions } from "@/features/credentials/hooks/use-credential-options";
import type { FlowNodeData } from "../types";
import { AGENT_TOOL_CATALOG, MODEL_PROVIDERS } from "../nodeCatalog/catalog";
import type { AgentModelConfig, AgentToolConfig } from "../types/agent";

export interface UseInspectorAgentConfigReturn {
  model: AgentModelConfig | null;
  provider: string;
  providerMeta: (typeof MODEL_PROVIDERS)[0];
  providerOptions: SelectOption[];
  credentialOptions: SelectOption[];
  credLoading: boolean;
  credError: Error | null;
  patchModel: (patch: Partial<AgentModelConfig>) => void;
  tools: AgentToolConfig[];
  moveTool: (idx: number, dir: -1 | 1) => void;
  deleteTool: (id: string) => void;
  toggleToolEnabled: (id: string, enabled: boolean) => void;
  patchTool: (toolId: string, patch: Record<string, unknown>) => void;
  toolSchemaFor: (toolKey: string) => SchemaField[];
  toolIconFor: (toolKey: string) => string;
  validateTool: (tool: AgentToolConfig) => Record<string, string>;
}

/**
 * Custom hook for managing inspector agent config state.
 * Handles model configuration, tool management, and credential options.
 */
export function useInspectorAgentConfig(
  node: Node<FlowNodeData>,
  updateNodeData: (id: string, patch: Partial<FlowNodeData>) => void
): UseInspectorAgentConfigReturn {
  const model = (node.data.model || null) as AgentModelConfig | null;
  const provider = model?.provider || "openai";
  const providerMeta = MODEL_PROVIDERS.find((p) => p.key === provider) || MODEL_PROVIDERS[0];

  const providerOptions = useMemo<SelectOption[]>(
    () => MODEL_PROVIDERS.map((p) => ({ value: p.key, label: p.label })),
    []
  );

  const credentialProvider = provider === "custom" ? undefined : provider;
  const {
    options: credentialItems,
    loading: credLoading,
    error: credError,
  } = useCredentialOptions(credentialProvider, provider !== "custom");

  const credentialOptions = useMemo<SelectOption[]>(
    () =>
      credentialItems.map((opt) => ({
        value: opt.id,
        label: opt.label,
        description: opt.accountEmail ? `${opt.provider} • ${opt.accountEmail}` : opt.provider,
      })),
    [credentialItems]
  );

  const patchModel = (patch: Partial<AgentModelConfig>) => {
    const next: AgentModelConfig = {
      provider: (patch.provider ?? model?.provider ?? "openai") as any,
      model: typeof patch.model === "string" ? patch.model : model?.model || "",
      credentialId:
        typeof patch.credentialId === "string"
          ? patch.credentialId
          : typeof model?.credentialId === "string"
            ? model.credentialId
            : "",
      apiKeyOverride:
        typeof patch.apiKeyOverride === "string"
          ? patch.apiKeyOverride
          : typeof model?.apiKeyOverride === "string"
            ? model.apiKeyOverride
            : "",
      baseUrl:
        typeof patch.baseUrl === "string"
          ? patch.baseUrl
          : typeof model?.baseUrl === "string"
            ? model.baseUrl
            : providerMeta.defaultBaseUrl,
    };
    updateNodeData(node.id, { model: next });
  };

  const tools = Array.isArray(node.data.tools) ? (node.data.tools as AgentToolConfig[]) : [];

  const moveTool = (idx: number, dir: -1 | 1) => {
    const next = [...tools];
    const to = idx + dir;
    if (to < 0 || to >= next.length) return;
    const [item] = next.splice(idx, 1);
    next.splice(to, 0, item);
    updateNodeData(node.id, { tools: next });
  };

  const deleteTool = (id: string) => {
    updateNodeData(node.id, { tools: tools.filter((t) => t.id !== id) });
  };

  const toggleToolEnabled = (id: string, enabled: boolean) => {
    updateNodeData(node.id, { tools: tools.map((t) => (t.id === id ? { ...t, enabled } : t)) });
  };

  const patchTool = (toolId: string, patch: Record<string, unknown>) => {
    updateNodeData(node.id, {
      tools: tools.map((t) => {
        if (t.id !== toolId) return t;
        const nextCredentialId =
          typeof patch.credentialId === "string" ? String(patch.credentialId).trim() : t.credentialId;
        const { credentialId: _, ...rest } = patch as any;
        return { ...t, credentialId: nextCredentialId || "", config: { ...(t.config || {}), ...rest } };
      }),
    });
  };

  const toolSchemaFor = (toolKey: string): SchemaField[] => {
    const def = AGENT_TOOL_CATALOG.find((t) => t.toolKey === toolKey);
    if (!def) return [];
    return [...(def.baseFields || []), ...(def.fields || [])];
  };

  const toolIconFor = (toolKey: string) => {
    const k = toolKey.toLowerCase();
    if (k.startsWith("gmail.")) return "gmail";
    if (k.startsWith("gsheets.")) return "googleSheets";
    if (k.startsWith("github.")) return "github";
    if (k.startsWith("bannerbear.") || k.startsWith("bananabear.")) return "bannerbear";
    return "app";
  };

  const validateTool = (tool: AgentToolConfig): Record<string, string> => {
    const def = AGENT_TOOL_CATALOG.find((t) => t.toolKey === tool.toolKey);
    const schema = def ? [...(def.baseFields || []), ...(def.fields || [])] : [];
    const value = { credentialId: tool.credentialId || "", ...(tool.config || {}) } as Record<string, unknown>;
    const errors: Record<string, string> = {};
    for (const field of schema) {
      if (!field.required) continue;
      const v = value[field.key];
      if (v === undefined || v === null || (typeof v === "string" && !v.trim())) {
        errors[field.key] = "Required";
      }
    }
    return errors;
  };

  return {
    model,
    provider,
    providerMeta,
    providerOptions,
    credentialOptions,
    credLoading,
    credError,
    patchModel,
    tools,
    moveTool,
    deleteTool,
    toggleToolEnabled,
    patchTool,
    toolSchemaFor,
    toolIconFor,
    validateTool,
  };
}
