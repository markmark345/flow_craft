"use client";

import { useMemo } from "react";
import { Node } from "reactflow";

import { Input } from "@/components/ui/input";
import { Select, type SelectOption } from "@/components/ui/select";
import { SchemaForm } from "@/components/ui/SchemaForm/SchemaForm";
import type { SchemaField } from "@/components/ui/SchemaForm/types";
import { useCredentialOptions } from "@/features/credentials/hooks/use-credential-options";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { IconButton } from "@/components/ui/icon-button";

import { useBuilderStore } from "../../store/use-builder-store";
import { FlowNodeData } from "../../types";
import { NODE_CATALOG } from "../../types/node-catalog";
import { MODEL_PROVIDERS } from "../../nodeCatalog/catalog";
import { type AgentModelConfig, type AgentToolConfig } from "../../types/agent";
import { useWizardStore } from "../../wizard/store/use-wizard-store";
import { FieldRow } from "./field-row";
import { AgentModelTab } from "./agent/AgentModelTab";
import { AgentMemoryTab } from "./agent/AgentMemoryTab";
import { AgentToolsTab } from "./agent/AgentToolsTab";

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
  const tools = Array.isArray(node.data.tools) ? (node.data.tools as AgentToolConfig[]) : [];

  const patchModel = (patch: Partial<AgentModelConfig>) => {
    const provider = patch.provider ?? model?.provider ?? "openai";
    const providerMeta = MODEL_PROVIDERS.find((p) => p.key === provider) || MODEL_PROVIDERS[0];
    const next: AgentModelConfig = {
      provider: provider as any,
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

  const tabs: Array<{ id: AgentTab; label: string }> = [
    { id: "model", label: "Model" },
    { id: "memory", label: "Memory" },
    { id: "tools", label: "Tools" },
  ];

  return (
    <div className="space-y-5">
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
          <Button
            key={t.id}
            variant="ghost"
            className={`px-3 py-2 h-auto text-xs font-bold rounded-none border-b-2 transition-all ${
              tab === t.id ? "text-accent border-accent" : "text-muted hover:text-text border-transparent"
            }`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </Button>
        ))}
      </div>

      {tab === "model" && <AgentModelTab model={model} onPatchModel={patchModel} />}

      {tab === "memory" && (
        <AgentMemoryTab
          memoryType={node.data.memory?.type || "none"}
          onUpdateMemory={(v) => {
            if (v === "conversation") updateNodeData(node.id, { memory: { type: "conversation", config: {} } as any });
            else updateNodeData(node.id, { memory: null });
          }}
        />
      )}

      {tab === "tools" && (
        <AgentToolsTab
          tools={tools}
          flowId={flowId}
          nodeId={node.id}
          openAddTool={openAddTool}
          onMove={(idx, dir) => {
            const next = [...tools];
            const to = idx + dir;
            if (to < 0 || to >= next.length) return;
            const [item] = next.splice(idx, 1);
            next.splice(to, 0, item);
            updateNodeData(node.id, { tools: next });
          }}
          onDelete={(id) => updateNodeData(node.id, { tools: tools.filter((t) => t.id !== id) })}
          onToggleEnabled={(id, enabled) =>
            updateNodeData(node.id, { tools: tools.map((t) => (t.id === id ? { ...t, enabled } : t)) })
          }
          onPatch={(toolId, patch) => {
            updateNodeData(node.id, {
              tools: tools.map((t) => {
                if (t.id !== toolId) return t;
                const nextCredentialId =
                  typeof patch.credentialId === "string" ? String(patch.credentialId).trim() : t.credentialId;
                const { credentialId: _, ...rest } = patch as any;
                return { ...t, credentialId: nextCredentialId || "", config: { ...(t.config || {}), ...rest } };
              }),
            });
          }}
        />
      )}
    </div>
  );
}
