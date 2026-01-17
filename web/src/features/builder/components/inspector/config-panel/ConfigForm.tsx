"use client";

import { Node } from "reactflow";
import { FlowNodeData } from "../../../types";
import { NODE_CATALOG } from "../../../types/node-catalog";
import { IfConfig } from "../../if-config";
import { FieldRow } from "../field-row";
import { ScheduleConfig } from "../schedule-config";
import { SlackConfig } from "../slack-config";
import { InspectorAppConfig } from "../app-config";
import { InspectorChatModelConfig } from "../chat-model-config";
import { InspectorAgentConfig } from "../agent-config";
import { chatModelProviderLabel } from "../../../lib/node-utils";

interface ConfigFormProps {
  node: Node<FlowNodeData>;
  updateNodeData: (id: string, patch: Partial<FlowNodeData>) => void;
  updateNodeConfig: (id: string, patch: Record<string, unknown>) => void;
}

export function ConfigForm({ node, updateNodeData, updateNodeConfig }: ConfigFormProps) {
  const meta = NODE_CATALOG[node.data.nodeType];


  const handleChatModelPatch = (patch: Record<string, unknown>) => {
    const currentProvider = typeof node.data.config?.provider === "string" ? String(node.data.config.provider) : "openai";
    const nextProvider = typeof patch.provider === "string" ? String(patch.provider) : currentProvider;
    if (currentProvider.trim().toLowerCase() !== nextProvider.trim().toLowerCase()) {
      const prevDefaultLabel = `${chatModelProviderLabel(currentProvider)} Chat Model`;
      const nextDefaultLabel = `${chatModelProviderLabel(nextProvider)} Chat Model`;
      if (typeof node.data.label === "string" && node.data.label.trim() === prevDefaultLabel) {
        updateNodeData(node.id, { label: nextDefaultLabel });
      }
    }
    updateNodeConfig(node.id, patch);
  };

  if (node.data.nodeType === "slack") {
    return <SlackConfig config={node.data.config || {}} onPatch={(patch) => updateNodeConfig(node.id, patch)} />;
  }
  if (node.data.nodeType === "app") {
    return <InspectorAppConfig config={node.data.config || {}} onPatch={(patch) => updateNodeConfig(node.id, patch)} />;
  }
  if (node.data.nodeType === "aiAgent") {
    return (
      <InspectorAgentConfig node={node} updateNodeData={updateNodeData} updateNodeConfig={updateNodeConfig} />
    );
  }
  if (node.data.nodeType === "chatModel") {
    return <InspectorChatModelConfig config={node.data.config || {}} onPatch={handleChatModelPatch} />;
  }
  if (node.data.nodeType === "cron") {
    return <ScheduleConfig config={node.data.config || {}} onPatch={(patch) => updateNodeConfig(node.id, patch)} />;
  }
  if (node.data.nodeType === "if") {
    return <IfConfig config={node.data.config || {}} onPatch={(patch) => updateNodeConfig(node.id, patch)} />;
  }

  return (
    <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
      {meta?.fields.map((field) => (
        <FieldRow
          key={field.key}
          field={field}
          value={node.data.config?.[field.key]}
          onChange={(v) => updateNodeConfig(node.id, { [field.key]: v })}
        />
      ))}
    </form>
  );
}
