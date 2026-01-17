"use client";

import { useMemo } from "react";
import { FlowNodeData } from "../types";
import { NODE_CATALOG } from "../types/node-catalog";
import { getNodeAccent, getNodeIconType } from "../lib/node-utils";

const accentVar: Record<string, string> = {
  accent: "var(--accent)",
  success: "var(--success)",
  warning: "var(--warning)",
  error: "var(--error)",
  trigger: "var(--trigger)",
  slack: "var(--slack)",
  neutral: "var(--muted)",
};

export function useFlowNodeStyles(data: FlowNodeData) {
  return useMemo(() => {
    const meta = NODE_CATALOG[data.nodeType];
    const accent = meta?.accent || "accent";
    const baseAccentColor = accentVar[accent] || "var(--accent)";
    const appKey = typeof data.config?.app === "string" ? String(data.config.app).trim().toLowerCase() : "";
    
    const accentColor = getNodeAccent(data.nodeType, appKey, baseAccentColor);
    const isTrigger = meta?.category === "Triggers";
    const isModelNode =
      data.nodeType === "chatModel" ||
      data.nodeType === "openaiChatModel" ||
      data.nodeType === "geminiChatModel" ||
      data.nodeType === "grokChatModel";
    
    const hasMainInput = !isTrigger && !isModelNode;
    const iconNodeType = getNodeIconType(data.nodeType, appKey);

    const runtimeStatus = data.runtimeStatus;
    const runtimeTone = (() => {
      if (!runtimeStatus) return undefined;
      if (runtimeStatus === "success") return "var(--success)";
      if (runtimeStatus === "failed") return "var(--error)";
      if (runtimeStatus === "running") return accentColor;
      if (runtimeStatus === "canceled") return "var(--muted)";
      return "var(--muted)";
    })();

    const topBar = `linear-gradient(90deg, ${accentColor} 0%, color-mix(in srgb, ${accentColor} 55%, white) 100%)`;
    const iconBg = `color-mix(in srgb, ${accentColor} 14%, transparent)`;
    const iconRing = `color-mix(in srgb, ${accentColor} 22%, transparent)`;

    return {
      meta,
      accentColor,
      isTrigger,
      isModelNode,
      hasMainInput,
      iconNodeType,
      runtimeTone,
      topBar,
      iconBg,
      iconRing,
    };
  }, [data]);
}
