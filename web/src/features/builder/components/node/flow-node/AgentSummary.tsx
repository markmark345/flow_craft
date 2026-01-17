"use client";

import { type AgentMemoryConfig, type AgentToolConfig } from "../../../types/agent";
import type { FlowNodeData } from "../../../types";
import { ModelSection } from "./agent-summary/ModelSection";
import { MemorySection } from "./agent-summary/MemorySection";
import { ToolsSection } from "./agent-summary/ToolsSection";

interface AgentSummaryProps {
  data: FlowNodeData;
  nodeId: string;
  flowId: string | null | undefined;
  onOpenTab: (tab: "model" | "memory" | "tools") => void;
  onAddTool: () => void;
}

export function AgentSummary({ data, onOpenTab, onAddTool }: AgentSummaryProps) {
  if (data.nodeType !== "aiAgent") return null;

  const modelCfg = data.model as any;
  const memoryCfg = (data.memory as AgentMemoryConfig | null | undefined) || null;
  const memoryType = typeof (memoryCfg as any)?.type === "string" ? String((memoryCfg as any).type).trim() : "none";
  const memoryLabel = memoryType === "conversation" ? "Conversation" : memoryType === "vector" ? "Vector" : "None";

  const tools = Array.isArray(data.tools) ? (data.tools as AgentToolConfig[]) : [];
  const toolKeys = tools
    .filter((t) => t && typeof (t as any).toolKey === "string" && Boolean((t as any).enabled ?? true))
    .map((t) => String((t as any).toolKey))
    .slice(0, 2);

  const toolIcons = toolKeys.map((toolKey) => {
    const k = toolKey.toLowerCase();
    if (k.startsWith("gmail.")) return "gmail";
    if (k.startsWith("gsheets.")) return "googleSheets";
    if (k.startsWith("github.")) return "github";
    if (k.startsWith("bannerbear.") || k.startsWith("bananabear.")) return "bannerbear";
    return "app";
  });

  const toolsCount = tools.filter((t) => t && Boolean((t as any).enabled ?? true)).length;

  return (
    <div className="mt-4 pt-4 border-t border-border space-y-2">
      <div className="text-[10px] font-bold uppercase tracking-wider text-muted">Attachments</div>

      <ModelSection modelCfg={modelCfg} onOpenTab={onOpenTab} />

      <MemorySection memoryType={memoryType} memoryLabel={memoryLabel} onOpenTab={onOpenTab} />

      <ToolsSection
        toolIcons={toolIcons}
        toolsCount={toolsCount}
        onOpenTab={onOpenTab}
        onAddTool={onAddTool}
      />
    </div>
  );
}
