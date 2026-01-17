"use client";

import { Icon } from "@/components/ui/icon";
import { IconButton } from "@/components/ui/icon-button";
import { NodeIcon } from "../../node-icon";
import { cn } from "@/lib/cn";
import { ConnectorLine } from "./ConnectorLine";

interface ToolsSectionProps {
  toolIcons: string[];
  toolsCount: number;
  onOpenTab: (tab: "tools") => void;
  onAddTool: () => void;
}

export function ToolsSection({ toolIcons, toolsCount, onOpenTab, onAddTool }: ToolsSectionProps) {
  return (
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
              toolIcons.map((icon, idx) => (
                <NodeIcon key={`${icon}-${idx}`} nodeType={icon as any} className="h-4 w-4" />
              ))
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
          <IconButton
            icon="add"
            className="nodrag h-9 w-9 rounded-xl border border-border bg-panel text-muted hover:text-text hover:bg-surface transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onAddTool();
            }}
            title="Add tool"
          />
        </div>
      </div>
    </div>
  );
}
