"use client";

import { NodeIcon } from "../../node-icon";
import { cn } from "@/lib/cn";
import { isValidAgentModelConfig } from "../../../../types/agent";
import { ConnectorLine } from "./ConnectorLine";

interface ModelSectionProps {
  modelCfg: any;
  onOpenTab: (tab: "model") => void;
}

export function ModelSection({ modelCfg, onOpenTab }: ModelSectionProps) {
  const provider = typeof modelCfg?.provider === "string" ? String(modelCfg.provider).trim().toLowerCase() : "";
  const modelName = typeof modelCfg?.model === "string" ? String(modelCfg.model).trim() : "";
  const hasModel = isValidAgentModelConfig(modelCfg);
  const providerIcon = provider === "gemini" || provider === "grok" || provider === "openai" ? provider : "openai";

  return (
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
            <NodeIcon nodeType={providerIcon as any} className="h-5 w-5" />
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
  );
}
