"use client";

import { Input } from "@/shared/components/input";
import { CollapsibleSection } from "@/shared/components/collapsible-section";
import { useNodeDnd } from "../../hooks/use-node-dnd";
import { useNodePalette } from "../../hooks/use-node-palette";
import { NodeIcon } from "./node-icon";
import { Icon } from "@/shared/components/icon";
import { useBuilderStore } from "../../store/use-builder-store";
import { useWizardStore } from "../../wizard/store/use-wizard-store";
import { APP_CATALOG } from "../../nodeCatalog/catalog";
import type { AppKey } from "../../nodeCatalog/catalog";
import type { BuilderNodeType } from "../../types";

const accentVar: Record<string, string> = {
  accent: "var(--accent)",
  success: "var(--success)",
  warning: "var(--warning)",
  error: "var(--error)",
  trigger: "var(--trigger)",
  slack: "var(--slack)",
  neutral: "var(--muted)",
};

export function NodePalette() {
  const { onDragStart } = useNodeDnd();
  const flowId = useBuilderStore((s) => s.flowId);
  const viewport = useBuilderStore((s) => s.viewport);
  const addNode = useBuilderStore((s) => s.addNode);
  const openAddAppNode = useWizardStore((s) => s.openAddAppNode);
  const openAddAgent = useWizardStore((s) => s.openAddAgent);

  const {
    query,
    setQuery,
    forceExpand,
    isCollapsed,
    setSectionOpen,
    canvasItems,
    filtered,
    appItems,
    computeCenter,
  } = useNodePalette(viewport);

  return (
    <aside className="w-72 bg-panel border-r border-border flex flex-col z-20 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)]">
      <div className="p-4 border-b border-border">
        <div className="relative group">
          <Icon
            name="search"
            className="absolute left-2.5 top-2 text-muted group-focus-within:text-accent transition-colors text-[20px]"
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search nodes..."
            className="h-9 pl-9 bg-surface2 shadow-soft"
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto p-3 space-y-4 fc-scrollbar">
        {/* Wizard-first groups */}
        <CollapsibleSection
          title="App Actions"
          open={!isCollapsed("palette.appActions")}
          onOpenChange={(open) => setSectionOpen("palette.appActions", open)}
          disabled={forceExpand}
          contentClassName="space-y-1"
        >
          {appItems.map((item) => {
            const appKey = item.appKey as AppKey;
            const c =
              appKey === "googleSheets"
                ? accentVar.success
                : appKey === "gmail"
                  ? accentVar.error
                  : appKey === "bannerbear"
                    ? accentVar.warning
                    : accentVar.accent;
            return (
              <div
                key={item.appKey}
                draggable
                onDragStart={(e) => {
                  onDragStart(e, { type: "app", label: "Action in an app" });
                  e.dataTransfer.setData("application/flowcraft/app-key", appKey);
                }}
                className="flex items-center gap-3 p-2 rounded-lg bg-surface hover:bg-surface2 cursor-grab active:cursor-grabbing border border-border hover:shadow-soft transition-all group select-none"
                style={{ borderColor: "color-mix(in srgb, var(--border) 70%, transparent)" }}
              >
                <div
                  className="w-8 h-8 rounded-md flex items-center justify-center shrink-0 border"
                  style={{
                    color: c,
                    background: `color-mix(in srgb, ${c} 14%, transparent)`,
                    borderColor: `color-mix(in srgb, ${c} 24%, transparent)`,
                  }}
                >
                  <NodeIcon nodeType={item.icon as any} className="h-5 w-5" />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-sm font-semibold text-text group-hover:text-text">{item.label}</span>
                  <span className="text-[10px] text-muted truncate">
                    {item.description || "Choose an action via the wizard"}
                  </span>
                </div>
                <button
                  type="button"
                  className="h-8 w-8 rounded-md border border-border bg-surface2 text-muted hover:text-text hover:bg-surface transition-colors flex items-center justify-center"
                  title="Add with wizard"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!flowId) return;
                    openAddAppNode(flowId, appKey);
                  }}
                >
                  <Icon name="add" className="text-[18px]" />
                </button>
              </div>
            );
          })}
        </CollapsibleSection>

        <CollapsibleSection
          title="AI Agent"
          open={!isCollapsed("palette.aiAgent")}
          onOpenChange={(open) => setSectionOpen("palette.aiAgent", open)}
          disabled={forceExpand}
          contentClassName="space-y-1"
        >
          <div
            draggable
            onDragStart={(e) => onDragStart(e, { type: "aiAgent", label: "AI Agent" })}
            className="flex items-center gap-3 p-2 rounded-lg bg-surface hover:bg-surface2 cursor-grab active:cursor-grabbing border border-border hover:shadow-soft transition-all group select-none"
            style={{ borderColor: "color-mix(in srgb, var(--border) 70%, transparent)" }}
          >
            <div
              className="w-8 h-8 rounded-md flex items-center justify-center shrink-0 border"
              style={{
                color: accentVar.neutral,
                background: `color-mix(in srgb, ${accentVar.neutral} 14%, transparent)`,
                borderColor: `color-mix(in srgb, ${accentVar.neutral} 24%, transparent)`,
              }}
            >
              <NodeIcon nodeType="aiAgent" className="h-5 w-5" />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-sm font-semibold text-text group-hover:text-text">AI Agent</span>
              <span className="text-[10px] text-muted truncate">Add an agent with Model/Memory/Tools</span>
            </div>
            <button
              type="button"
              className="h-8 w-8 rounded-md border border-border bg-surface2 text-muted hover:text-text hover:bg-surface transition-colors flex items-center justify-center"
              title="Add with wizard"
              onClick={(e) => {
                e.stopPropagation();
                if (!flowId) return;
                openAddAgent(flowId);
              }}
            >
              <Icon name="add" className="text-[18px]" />
            </button>
          </div>
        </CollapsibleSection>

        {filtered.map((cat) => (
          <CollapsibleSection
            key={cat.id}
            title={cat.label}
            open={!isCollapsed(`palette.cat.${cat.id}`)}
            onOpenChange={(open) => setSectionOpen(`palette.cat.${cat.id}`, open)}
            disabled={forceExpand}
            contentClassName="space-y-1"
          >
            {cat.items
              .filter((item) => item.type !== "app" && item.type !== "aiAgent")
              .map((item) => {
                const c = accentVar[item.accent] || "var(--accent)";
                return (
                  <div
                    key={item.type}
                    draggable
                    onDragStart={(e) => onDragStart(e, { type: item.type, label: item.label })}
                    className="flex items-center gap-3 p-2 rounded-lg bg-surface hover:bg-surface2 cursor-grab active:cursor-grabbing border border-border hover:shadow-soft transition-all group select-none"
                    style={{
                      borderColor: "color-mix(in srgb, var(--border) 70%, transparent)",
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-md flex items-center justify-center shrink-0 border"
                      style={{
                        color: c,
                        background: `color-mix(in srgb, ${c} 14%, transparent)`,
                        borderColor: `color-mix(in srgb, ${c} 24%, transparent)`,
                      }}
                    >
                      <NodeIcon nodeType={item.type} className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-semibold text-text group-hover:text-text">{item.label}</span>
                      <span className="text-[10px] text-muted truncate">{item.description}</span>
                    </div>

                    <button
                      type="button"
                      className="ml-auto h-8 w-8 rounded-md border border-border bg-surface2 text-muted hover:text-text hover:bg-surface transition-colors flex items-center justify-center"
                      title="Add"
                      onClick={(e) => {
                        e.stopPropagation();
                        const pos = computeCenter();
                        addNode(item.type as BuilderNodeType, pos, item.label);
                      }}
                    >
                      <Icon name="add" className="text-[18px]" />
                    </button>
                  </div>
                );
              })}
          </CollapsibleSection>
        ))}

        {canvasItems.length ? (
          <CollapsibleSection
            title="Canvas"
            open={!isCollapsed("palette.canvas")}
            onOpenChange={(open) => setSectionOpen("palette.canvas", open)}
            disabled={forceExpand}
            contentClassName="space-y-1"
          >
            {canvasItems.map((item) => {
              const c = accentVar[item.accent] || "var(--accent)";
              return (
                <div
                  key={item.type}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("application/reactflow/node-type", item.type);
                    e.dataTransfer.setData("application/reactflow/node-label", item.label);
                    e.dataTransfer.effectAllowed = "move";
                  }}
                  className="flex items-center gap-3 p-2 rounded-lg bg-surface hover:bg-surface2 cursor-grab active:cursor-grabbing border border-border hover:shadow-soft transition-all group select-none"
                  style={{
                    borderColor: "color-mix(in srgb, var(--border) 70%, transparent)",
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-md flex items-center justify-center shrink-0 border"
                    style={{
                      color: c,
                      background: `color-mix(in srgb, ${c} 14%, transparent)`,
                      borderColor: `color-mix(in srgb, ${c} 24%, transparent)`,
                    }}
                  >
                    <Icon name="sticky_note" className="text-[18px]" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold text-text group-hover:text-text">{item.label}</span>
                    <span className="text-[10px] text-muted truncate">{item.description}</span>
                  </div>
                </div>
              );
            })}
          </CollapsibleSection>
        ) : null}
      </div>
    </aside>
  );
}
