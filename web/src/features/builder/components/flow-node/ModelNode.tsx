"use client";

import { Handle, Position } from "reactflow";
import { NodeIcon } from "../node-icon";
import { cn } from "@/shared/lib/cn";
import type { FlowNodeData } from "../../types";

interface ModelNodeProps {
  data: FlowNodeData;
  selected: boolean;
  handleOutsideX: number;
}

export function ModelNode({ data, selected, handleOutsideX }: ModelNodeProps) {
  const provider =
    data.nodeType === "chatModel"
      ? typeof data.config?.provider === "string"
        ? String(data.config.provider).trim().toLowerCase()
        : "openai"
      : data.nodeType === "geminiChatModel"
        ? "gemini"
        : data.nodeType === "grokChatModel"
          ? "grok"
          : "openai";

  const providerLabel = provider === "gemini" ? "Gemini" : provider === "grok" ? "Grok" : "OpenAI";
  const providerTone = provider === "gemini" ? "var(--warning)" : provider === "grok" ? "var(--error)" : "var(--accent)";
  const modelName = typeof data.config?.model === "string" ? String(data.config.model).trim() : "";

  // Validation check
  const isValid = modelName.length > 0;
  const ringTone = isValid ? providerTone : "var(--error)";

  const inputHandleClass =
    "!w-3 !h-3 !rounded-full !border-[2.5px] shadow-soft cursor-crosshair transition-transform hover:scale-125";

  return (
    <div className="group relative flex flex-col items-center">
      <div
        className={cn(
          "relative w-24 h-24 rounded-full border bg-panel flex items-center justify-center",
          selected ? "shadow-lift" : "shadow-soft hover:shadow-lift"
        )}
        style={{
          borderColor: selected ? "transparent" : `color-mix(in srgb, ${ringTone} 40%, var(--border))`,
          boxShadow: selected ? `0 0 0 2px ${ringTone}, var(--shadow-lift)` : undefined,
        }}
      >
        <div
          className="w-11 h-11 rounded-full border flex items-center justify-center"
          style={{
            color: ringTone,
            background: `color-mix(in srgb, ${ringTone} 12%, transparent)`,
            borderColor: `color-mix(in srgb, ${ringTone} 20%, transparent)`,
          }}
        >
          <NodeIcon nodeType={provider} className="h-6 w-6" />
        </div>

        <Handle
          type="source"
          position={Position.Top}
          className={inputHandleClass}
          style={{
            background: "var(--panel)",
            borderColor: ringTone,
            top: -handleOutsideX,
            left: "50%",
            transform: "translateX(-50%)",
          }}
          title="Connect to AI Agent"
        />
      </div>

      <div className="mt-2 text-xs font-bold text-text text-center max-w-32 truncate">
        {data.label || `${providerLabel} Chat Model`}
      </div>
      <div className="text-[10px] text-muted text-center max-w-32 truncate">{modelName || providerLabel}</div>
    </div>
  );
}
