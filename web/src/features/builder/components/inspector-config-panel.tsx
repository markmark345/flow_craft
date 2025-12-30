"use client";

import { Input } from "@/shared/components/input";
import { Node } from "reactflow";

import { NODE_CATALOG } from "../types/node-catalog";
import { FlowNodeData } from "../types";
import { NodeIcon } from "./node-icon";
import { IfConfig } from "./if-config";
import { FieldRow } from "./inspector-field-row";
import { ScheduleConfig } from "./inspector-schedule-config";
import { SlackConfig } from "./inspector-slack-config";
import { InspectorAppConfig } from "./inspector-app-config";
import { InspectorChatModelConfig } from "./inspector-chat-model-config";
import { InspectorAgentConfig } from "./inspector-agent-config";

export function InspectorConfigPanel({
  node,
  updateNodeData,
  updateNodeConfig,
}: {
  node: Node<FlowNodeData>;
  updateNodeData: (id: string, patch: Partial<FlowNodeData>) => void;
  updateNodeConfig: (id: string, patch: Record<string, unknown>) => void;
}) {
  const meta = NODE_CATALOG[node.data.nodeType];
  const valid = meta?.validate ? meta.validate(node.data) : true;
  const nodeCode = `node_${node.id.slice(0, 5)}`;
  const accent = meta?.accent || "accent";
  const accentVar: Record<string, string> = {
    accent: "var(--accent)",
    success: "var(--success)",
    warning: "var(--warning)",
    error: "var(--error)",
    trigger: "var(--trigger)",
    slack: "var(--slack)",
    neutral: "var(--muted)",
  };
  const baseAccentColor = accentVar[accent] || "var(--accent)";
  const provider =
    node.data.nodeType === "chatModel" && typeof node.data.config?.provider === "string"
      ? String(node.data.config.provider).trim().toLowerCase()
      : "";
  const appKey =
    node.data.nodeType === "app" && typeof node.data.config?.app === "string"
      ? String(node.data.config.app).trim().toLowerCase()
      : "";
  const accentColor =
    node.data.nodeType === "chatModel"
      ? provider === "gemini"
        ? "var(--warning)"
        : provider === "grok"
          ? "var(--error)"
          : "var(--accent)"
      : node.data.nodeType === "app"
        ? appKey === "googlesheets" || appKey === "gsheets"
          ? "var(--success)"
          : appKey === "gmail"
            ? "var(--error)"
            : appKey === "bannerbear" || appKey === "bananabear"
              ? "var(--warning)"
              : appKey === "github"
                ? "var(--accent)"
                : baseAccentColor
        : baseAccentColor;

  const iconNodeType = (() => {
    if (node.data.nodeType === "chatModel") {
      return provider === "gemini" || provider === "grok" || provider === "openai" ? provider : "openai";
    }
    if (node.data.nodeType === "app") {
      if (appKey === "googlesheets" || appKey === "gsheets" || appKey === "googlesheet") return "googleSheets";
      if (appKey === "gmail") return "gmail";
      if (appKey === "github") return "github";
      if (appKey === "bannerbear" || appKey === "bananabear") return "bannerbear";
      return "app";
    }
    return node.data.nodeType;
  })();
  const chatModelProviderLabel = (provider: string) => {
    const p = provider.trim().toLowerCase();
    if (p === "gemini") return "Gemini";
    if (p === "grok") return "Grok";
    return "OpenAI";
  };
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

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4 pb-5 border-b border-border">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border shadow-soft"
          style={{
            color: accentColor,
            background: `color-mix(in srgb, ${accentColor} 12%, transparent)`,
            borderColor: `color-mix(in srgb, ${accentColor} 20%, transparent)`,
          }}
        >
          <NodeIcon nodeType={iconNodeType} className="h-6 w-6" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-text truncate">{meta?.label || "Node"}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="px-1.5 py-0.5 rounded bg-surface2 text-[10px] font-mono text-muted border border-border">
              {nodeCode}
            </span>
            <span
              className={`w-1.5 h-1.5 rounded-full ${valid ? "bg-green" : "bg-red"}`}
              title={valid ? "Valid configuration" : "Needs configuration"}
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-bold text-muted">Label</label>
        <Input
          value={node.data.label}
          onChange={(e) => updateNodeData(node.id, { label: e.target.value })}
          className="h-10 rounded-lg bg-surface2"
        />
      </div>

      {node.data.nodeType === "slack" ? (
        <SlackConfig config={node.data.config || {}} onPatch={(patch) => updateNodeConfig(node.id, patch)} />
      ) : node.data.nodeType === "app" ? (
        <InspectorAppConfig config={node.data.config || {}} onPatch={(patch) => updateNodeConfig(node.id, patch)} />
      ) : node.data.nodeType === "aiAgent" ? (
        <InspectorAgentConfig node={node} updateNodeData={updateNodeData} updateNodeConfig={updateNodeConfig} />
      ) : node.data.nodeType === "chatModel" ? (
        <InspectorChatModelConfig config={node.data.config || {}} onPatch={handleChatModelPatch} />
      ) : node.data.nodeType === "cron" ? (
        <ScheduleConfig config={node.data.config || {}} onPatch={(patch) => updateNodeConfig(node.id, patch)} />
      ) : node.data.nodeType === "if" ? (
        <IfConfig config={node.data.config || {}} onPatch={(patch) => updateNodeConfig(node.id, patch)} />
      ) : (
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
      )}

      <div className="space-y-2 pt-4 border-t border-border">
        <div className="text-xs font-bold uppercase tracking-wide text-muted">Failure handling</div>
        <FieldRow
          field={{
            key: "continueOnFail",
            label: "Continue on fail",
            type: "toggle",
            helpText: "When enabled, the workflow continues even if this node errors.",
          }}
          value={node.data.config?.continueOnFail}
          onChange={(v) => updateNodeConfig(node.id, { continueOnFail: v })}
        />
        {meta?.category !== "Triggers" ? (
          <FieldRow
            field={{
              key: "routeToErrorTrigger",
              label: "Route to error trigger",
              type: "toggle",
              helpText:
                "When enabled, if this node errors the workflow jumps to the Error Trigger branch (if present).",
            }}
            value={node.data.config?.routeToErrorTrigger}
            onChange={(v) => updateNodeConfig(node.id, { routeToErrorTrigger: v })}
          />
        ) : null}
      </div>
    </div>
  );
}
