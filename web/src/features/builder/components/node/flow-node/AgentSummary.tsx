"use client";

import { Icon } from "@/shared/components/icon";
import { NodeIcon } from "../node-icon";
import { cn } from "@/shared/lib/cn";
import { isValidAgentModelConfig, type AgentMemoryConfig, type AgentToolConfig } from "../../../types/agent";
import type { FlowNodeData } from "../../../types";

interface AgentSummaryProps {
  data: FlowNodeData;
  nodeId: string;
  flowId: string | null | undefined;
  onOpenTab: (tab: "model" | "memory" | "tools") => void;
  onAddTool: () => void;
}

const ConnectorLine = () => (
  <div className="w-6 h-10 flex items-center justify-center shrink-0">
    <svg width="24" height="40" viewBox="0 0 24 40" fill="none" aria-hidden="true">
      <path
        d="M12 0v18c0 5-3 8-8 8H2"
        stroke="var(--border)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="3 4"
        opacity="0.8"
      />
    </svg>
  </div>
);

export function AgentSummary({ data, onOpenTab, onAddTool }: AgentSummaryProps) {
  if (data.nodeType !== "aiAgent") return null;

  const modelCfg = data.model as any;
  const provider = typeof modelCfg?.provider === "string" ? String(modelCfg.provider).trim().toLowerCase() : "";
  const modelName = typeof modelCfg?.model === "string" ? String(modelCfg.model).trim() : "";
  const hasModel = isValidAgentModelConfig(modelCfg);
  const providerIcon = provider === "gemini" || provider === "grok" || provider === "openai" ? provider : "openai";

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

      {/* Model Section */}
      <div className="flex items-center gap-3">
        <ConnectorLine />
        <div
          role="button"
          tabIndex={0}
          onClick={() => onOpenTab("model")}
          onKeyDown={(e) => {
            if (e.key !== "Enter" && e.key !== " ") return;
            e.preventDefault();
            onOpenTab("model");
          }}
          className={cn(
            "nodrag flex-1 cursor-pointer rounded-2xl border bg-surface2 hover:bg-surface transition-colors px-3 py-2 flex items-center justify-between gap-3",
            hasModel ? "border-border" : "border-red/40"
          )}
          title={hasModel ? modelName : "Model is required"}
        >
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="w-9 h-9 rounded-xl border flex items-center justify-center shrink-0"
              style={{
                color: hasModel ? "var(--accent)" : "var(--error)",
                background: hasModel
                  ? "color-mix(in srgb, var(--accent) var(--accent-tint, 10%), transparent)"
                  : "color-mix(in srgb, var(--error) 12%, transparent)",
                borderColor: hasModel
                  ? "color-mix(in srgb, var(--accent) 18%, transparent)"
                  : "color-mix(in srgb, var(--error) 22%, transparent)",
              }}
            >
              <NodeIcon nodeType={providerIcon} className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-text leading-none">
                Chat Model <span className="text-red">*</span>
              </div>
              <div className="text-[11px] text-muted truncate">{hasModel ? modelName : "Required"}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {!hasModel ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold border text-red border-red/30 bg-red/10">
                Missing
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold border text-green border-green/30 bg-green/10">
                Configured
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Memory Section */}
      <div className="flex items-center gap-3">
        <ConnectorLine />
        <div
          role="button"
          tabIndex={0}
          onClick={() => onOpenTab("memory")}
          onKeyDown={(e) => {
            if (e.key !== "Enter" && e.key !== " ") return;
            e.preventDefault();
            onOpenTab("memory");
          }}
          className="nodrag flex-1 cursor-pointer rounded-2xl border border-border bg-surface2 hover:bg-surface transition-colors px-3 py-2 flex items-center justify-between gap-3"
          title={memoryLabel}
        >
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="w-9 h-9 rounded-xl border flex items-center justify-center shrink-0"
              style={{
                color: "var(--muted)",
                background: "color-mix(in srgb, var(--muted) 10%, transparent)",
                borderColor: "color-mix(in srgb, var(--muted) 18%, transparent)",
              }}
            >
              <Icon name="data_object" className="text-[18px]" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-text leading-none">Memory</div>
              <div className="text-[11px] text-muted truncate">{memoryLabel}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {memoryType === "none" ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold border text-muted border-border bg-panel">
                None
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold border text-green border-green/30 bg-green/10">
                Enabled
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tools Section */}
      <div className="flex items-center gap-3">
        <ConnectorLine />
        <div
          role="button"
          tabIndex={0}
          onClick={() => onOpenTab("tools")}
          onKeyDown={(e) => {
            if (e.key !== "Enter" && e.key !== " ") return;
            e.preventDefault();
            onOpenTab("tools");
          }}
          className="nodrag flex-1 cursor-pointer rounded-2xl border border-border bg-surface2 hover:bg-surface transition-colors px-3 py-2 flex items-center justify-between gap-3"
          title={`${toolsCount} tool(s)`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <div
              className={cn("w-9 h-9 rounded-xl border flex items-center justify-center shrink-0", toolIcons.length ? "gap-1" : "")}
              style={{
                color: "var(--muted)",
                background: "color-mix(in srgb, var(--muted) 10%, transparent)",
                borderColor: "color-mix(in srgb, var(--muted) 18%, transparent)",
              }}
            >
              {toolIcons.length ? (
                toolIcons.map((icon, idx) => <NodeIcon key={`${icon}-${idx}`} nodeType={icon} className="h-4 w-4" />)
              ) : (
                <Icon name="handyman" className="text-[18px]" />
              )}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-text leading-none">Tools</div>
              <div className="text-[11px] text-muted truncate">{toolsCount ? `${toolsCount} added` : "None"}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              className="nodrag h-9 w-9 rounded-xl border border-border bg-panel text-muted hover:text-text hover:bg-surface transition-colors flex items-center justify-center"
              onClick={(e) => {
                e.stopPropagation();
                onAddTool();
              }}
              title="Add tool"
            >
              <Icon name="add" className="text-[18px]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
