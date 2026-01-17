"use client";

import { Node } from "reactflow";
import { FlowNodeData } from "../../../types";
import { NODE_CATALOG } from "../../../types/node-catalog";
import { NodeIcon } from "../../node/node-icon";

interface ConfigPanelHeaderProps {
  node: Node<FlowNodeData>;
}

export function ConfigPanelHeader({ node }: ConfigPanelHeaderProps) {
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

  return (
    <div className="flex items-start gap-4 pb-5 border-b border-border">
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border shadow-soft"
        style={{
          color: accentColor,
          background: `color-mix(in srgb, ${accentColor} 12%, transparent)`,
          borderColor: `color-mix(in srgb, ${accentColor} 20%, transparent)`,
        }}
      >
        <NodeIcon nodeType={iconNodeType as any} className="h-6 w-6" />
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
  );
}
