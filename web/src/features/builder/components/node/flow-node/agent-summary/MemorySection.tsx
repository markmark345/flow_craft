"use client";

import { Icon } from "@/components/ui/icon";
import { ConnectorLine } from "./ConnectorLine";

interface MemorySectionProps {
  memoryType: string;
  memoryLabel: string;
  onOpenTab: (tab: "memory") => void;
}

export function MemorySection({ memoryType, memoryLabel, onOpenTab }: MemorySectionProps) {
  return (
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
  );
}
