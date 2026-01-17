"use client";

import { useMemo } from "react";
import { Node } from "reactflow";

import { Input } from "@/shared/components/input";
import { Select, type SelectOption } from "@/shared/components/select";
import { SchemaForm } from "@/shared/components/SchemaForm/SchemaForm";
import type { SchemaField } from "@/shared/components/SchemaForm/types";
import { useCredentialOptions } from "@/features/credentials/hooks/use-credential-options";
import { Button } from "@/shared/components/button";
import { Icon } from "@/shared/components/icon";

import { useBuilderStore } from "../../store/use-builder-store";
import { FlowNodeData } from "../../types";
import { NODE_CATALOG } from "../../types/node-catalog";
import { AGENT_TOOL_CATALOG, MODEL_PROVIDERS } from "../../nodeCatalog/catalog";
import { isValidAgentModelConfig, type AgentModelConfig, type AgentToolConfig } from "../../types/agent";
import { NodeIcon } from "../node/node-icon";
import { useWizardStore } from "../../wizard/store/use-wizard-store";
import { FieldRow } from "./field-row";

type AgentTab = "model" | "memory" | "tools";

export function InspectorAgentConfig({
  node,
  updateNodeData,
  updateNodeConfig,
}: {
  node: Node<FlowNodeData>;
  updateNodeData: (id: string, patch: Partial<FlowNodeData>) => void;
  updateNodeConfig: (id: string, patch: Record<string, unknown>) => void;
}) {
  const tab = useBuilderStore((s) => s.agentInspectorTab);
  const setTab = useBuilderStore((s) => s.setAgentInspectorTab);
  const flowId = useBuilderStore((s) => s.flowId);
  const openAddTool = useWizardStore((s) => s.openAddAgentTool);

  const agentMeta = NODE_CATALOG.aiAgent;

  const model = (node.data.model || null) as AgentModelConfig | null;
  const provider = model?.provider || "openai";
  const providerMeta = MODEL_PROVIDERS.find((p) => p.key === provider) || MODEL_PROVIDERS[0];

  const providerOptions = useMemo<SelectOption[]>(
    () => MODEL_PROVIDERS.map((p) => ({ value: p.key, label: p.label })),
    []
  );

  const credentialProvider = provider === "custom" ? undefined : provider;
  const { options: credentialItems, loading: credLoading, error: credError } = useCredentialOptions(
    credentialProvider,
    provider !== "custom"
  );
  const credentialOptions = useMemo<SelectOption[]>(
    () =>
      credentialItems.map((opt) => ({
        value: opt.id,
        label: opt.label,
        description: opt.accountEmail ? `${opt.provider} • ${opt.accountEmail}` : opt.provider,
      })),
    [credentialItems]
  );

  const tabs: Array<{ id: AgentTab; label: string }> = [
    { id: "model", label: "Model" },
    { id: "memory", label: "Memory" },
    { id: "tools", label: "Tools" },
  ];

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
      if (typeof v !== "string" || !v.trim()) errors[field.key] = `${field.label} is required`;
    }
    if (def?.app === "bannerbear") {
      const cred = typeof value.credentialId === "string" ? value.credentialId.trim() : "";
      const apiKey = typeof (value as any).apiKey === "string" ? String((value as any).apiKey).trim() : "";
      if (!cred && !apiKey) errors.credentialId = "Select a credential or provide an API key";
    }
    return errors;
  };

  return (
    <div className="space-y-5">
      {/* Agent prompt/settings */}
      <div className="space-y-4">
        <div className="text-xs font-bold uppercase tracking-wide text-muted">Parameters</div>
        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
          {agentMeta.fields.map((field) => (
            <FieldRow
              key={field.key}
              field={field}
              value={node.data.config?.[field.key]}
              onChange={(v) => updateNodeConfig(node.id, { [field.key]: v })}
            />
          ))}
        </form>
      </div>

      <div className="flex items-center gap-2 border-b border-border">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`px-3 py-2 text-xs font-bold ${
              tab === t.id ? "text-accent border-b-2 border-accent" : "text-muted hover:text-text"
            }`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "model" ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg border flex items-center justify-center shrink-0"
              style={{
                background: "color-mix(in srgb, var(--accent) var(--accent-tint, 10%), transparent)",
                borderColor: "color-mix(in srgb, var(--accent) 18%, transparent)",
                color: "var(--accent)",
              }}
            >
              <NodeIcon nodeType={(provider === "custom" ? "chatModel" : (provider as any)) as any} className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold text-text">Chat Model</div>
              <div className="text-xs text-muted">Configure the model connection for this agent.</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-muted">Provider</label>
              <Select
                value={provider}
                options={providerOptions}
                onChange={(v) => {
                  const meta = MODEL_PROVIDERS.find((p) => p.key === v) || MODEL_PROVIDERS[0];
                  patchModel({
                    provider: meta.key as any,
                    model: meta.defaultModel,
                    baseUrl: meta.defaultBaseUrl,
                    credentialId: "",
                    apiKeyOverride: "",
                  });
                }}
                searchable
                searchPlaceholder="Search providers..."
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-muted">Credential (optional)</label>
              <Select
                value={model?.credentialId || ""}
                options={credentialOptions}
                onChange={(v) => patchModel({ credentialId: v })}
                placeholder={provider === "custom" ? "Not available" : "Select credential..."}
                searchable
                searchPlaceholder="Search credentials..."
                className={provider === "custom" ? "opacity-60 pointer-events-none" : ""}
              />
              {credLoading ? <div className="text-xs text-muted">Loading credentials...</div> : null}
              {credError ? <div className="text-xs text-red">{credError}</div> : null}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-muted">API key override (optional)</label>
              <Input
                value={model?.apiKeyOverride || ""}
                onChange={(e) => patchModel({ apiKeyOverride: e.target.value })}
                placeholder={provider === "gemini" ? "AIza..." : provider === "grok" ? "xai-..." : "sk-..."}
                className="h-10 rounded-lg bg-surface2 font-mono"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-muted">
                Model <span className="text-red"> *</span>
              </label>
              <Input
                value={model?.model || ""}
                onChange={(e) => patchModel({ model: e.target.value })}
                placeholder={providerMeta.defaultModel}
                className="h-10 rounded-lg bg-surface2 font-mono"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-muted">Base URL (optional)</label>
            <Input
              value={model?.baseUrl || ""}
              onChange={(e) => patchModel({ baseUrl: e.target.value })}
              placeholder={providerMeta.defaultBaseUrl}
              className="h-10 rounded-lg bg-surface2 font-mono"
            />
          </div>

          {!isValidAgentModelConfig(model) ? (
            <div className="text-xs text-red">Missing configuration: set a Model and either a Credential or API key.</div>
          ) : null}
        </div>
      ) : null}

      {tab === "memory" ? (
        <div className="space-y-4">
          <div className="text-sm font-bold text-text">Memory</div>
          <Select
            value={node.data.memory?.type || "none"}
            options={[
              { value: "none", label: "None", description: "No memory between runs" },
              { value: "conversation", label: "Conversation", description: "Keep recent context in memory" },
            ]}
            onChange={(v) => {
              if (v === "conversation") updateNodeData(node.id, { memory: { type: "conversation", config: {} } as any });
              else updateNodeData(node.id, { memory: null });
            }}
          />
          <div className="text-xs text-muted">Vector stores can be added later.</div>
        </div>
      ) : null}

      {tab === "tools" ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-text">Tools</div>
              <div className="text-xs text-muted">Configure tool connections available to the agent.</div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                if (!flowId) return;
                openAddTool(flowId, node.id);
              }}
            >
              <Icon name="add" className="text-[18px] mr-1" />
              Add tool
            </Button>
          </div>

          {tools.length === 0 ? (
            <div className="rounded-xl border border-border bg-surface2 p-4 text-xs text-muted">No tools yet.</div>
          ) : (
            <div className="space-y-3">
              {tools.map((tool, idx) => {
                const def = AGENT_TOOL_CATALOG.find((t) => t.toolKey === tool.toolKey);
                const schema = toolSchemaFor(tool.toolKey);
                const errors = validateTool(tool);
                const value = { credentialId: tool.credentialId || "", ...(tool.config || {}) };
                const icon = toolIconFor(tool.toolKey);
                const valid = Object.keys(errors).length === 0;
                return (
                  <div key={tool.id} className="rounded-xl border border-border bg-panel p-4 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className="w-9 h-9 rounded-lg border flex items-center justify-center shrink-0"
                          style={{
                            background: "color-mix(in srgb, var(--muted) 10%, transparent)",
                            borderColor: "color-mix(in srgb, var(--border) 70%, transparent)",
                            color: "var(--muted)",
                          }}
                        >
                          <NodeIcon nodeType={icon as any} className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-text truncate">{def?.label || tool.toolKey}</div>
                          <div className="text-[11px] text-muted font-mono truncate">{tool.toolKey}</div>
                        </div>
                        <span
                          className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            valid ? "text-green border-green/30 bg-green/10" : "text-red border-red/30 bg-red/10"
                          }`}
                          title={valid ? "Configured" : "Needs config"}
                        >
                          {valid ? "Configured" : "Needs config"}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          className="h-9 w-9 rounded-lg border border-border bg-surface2 text-muted hover:text-text hover:bg-surface transition-colors flex items-center justify-center"
                          onClick={() => moveTool(idx, -1)}
                          disabled={idx === 0}
                          title="Move up"
                        >
                          <Icon name="arrow_upward" className="text-[18px]" />
                        </button>
                        <button
                          type="button"
                          className="h-9 w-9 rounded-lg border border-border bg-surface2 text-muted hover:text-text hover:bg-surface transition-colors flex items-center justify-center"
                          onClick={() => moveTool(idx, 1)}
                          disabled={idx === tools.length - 1}
                          title="Move down"
                        >
                          <Icon name="arrow_downward" className="text-[18px]" />
                        </button>
                        <button
                          type="button"
                          className="h-9 w-9 rounded-lg border border-border bg-surface2 text-muted hover:text-text hover:bg-surface transition-colors flex items-center justify-center"
                          onClick={() => toggleToolEnabled(tool.id, !tool.enabled)}
                          title={tool.enabled ? "Disable" : "Enable"}
                        >
                          <Icon name={tool.enabled ? "toggle_on" : "toggle_off"} className="text-[18px]" />
                        </button>
                        <button
                          type="button"
                          className="h-9 w-9 rounded-lg border border-border bg-surface2 text-muted hover:text-red hover:bg-surface transition-colors flex items-center justify-center"
                          onClick={() => deleteTool(tool.id)}
                          title="Delete"
                        >
                          <Icon name="delete" className="text-[18px]" />
                        </button>
                      </div>
                    </div>

                    <SchemaForm schema={schema} value={value} errors={errors} onPatch={(patch) => patchTool(tool.id, patch)} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
