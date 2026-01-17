"use client";

import { Icon } from "@/components/ui/icon";
import { FlowNodeData } from "../../../types";

type Props = {
  data: FlowNodeData;
  isValid: boolean;
};

export function NodeFooter({ data, isValid }: Props) {
  if (data.nodeType === "if") {
    const condition = typeof data.config?.condition === "string" ? data.config.condition : "";
    if (!condition) return null;
    return (
      <div className="py-1 px-2 bg-surface2 rounded text-[11px] font-mono text-muted border border-border truncate">
        {condition}
      </div>
    );
  }

  if (data.nodeType === "webhook" || data.nodeType === "httpTrigger") {
    return (
      <div className="flex items-center gap-1.5 py-1 px-2 bg-surface2 rounded text-[11px] text-muted border border-border">
        <Icon name="bolt" className="text-[14px]" />
        <span>Active trigger</span>
      </div>
    );
  }

  if (data.nodeType === "slack") {
    const tone = isValid ? "var(--success)" : "var(--error)";
    return (
      <div
        className="flex items-center gap-1.5 py-1 px-2 rounded text-[11px] border"
        style={{
          background: `color-mix(in srgb, ${tone} 14%, transparent)`,
          borderColor: `color-mix(in srgb, ${tone} 24%, transparent)`,
          color: tone,
        }}
      >
        <Icon name={isValid ? "check_circle" : "error"} className="text-[14px]" />
        <span>{isValid ? "Configured" : "Needs config"}</span>
      </div>
    );
  }

  return null;
}
