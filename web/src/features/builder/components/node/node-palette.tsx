"use client";

import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { useNodeDnd } from "../../hooks/use-node-dnd";
import { useNodePalette } from "../../hooks/use-node-palette";
import { useBuilderStore } from "../../store/use-builder-store";
import { useWizardStore } from "../../wizard/store/use-wizard-store";
import type { AppKey } from "../../nodeCatalog/catalog";
import type { BuilderNodeType } from "../../types";
import { PaletteSearch } from "./palette/PaletteSearch";
import { PaletteItem } from "./palette/PaletteItem";
import { PaletteCanvasItem } from "./palette/PaletteCanvasItem";

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

  const getAppAccent = (appKey: AppKey) => {
    if (appKey === "googleSheets") return accentVar.success;
    if (appKey === "gmail") return accentVar.error;
    if (appKey === "bannerbear") return accentVar.warning;
    return accentVar.accent;
  };

  return (
    <aside className="w-72 bg-panel border-r border-border flex flex-col z-20 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)]">
      <PaletteSearch query={query} setQuery={setQuery} />

      <div className="flex-1 overflow-auto p-3 space-y-4 fc-scrollbar">
        <CollapsibleSection
          title="App Actions"
          open={!isCollapsed("palette.appActions")}
          onOpenChange={(open) => setSectionOpen("palette.appActions", open)}
          disabled={forceExpand}
          contentClassName="space-y-1"
        >
          {appItems.map((item) => {
            const appKey = item.appKey as AppKey;
            return (
              <PaletteItem
                key={item.appKey}
                label={item.label}
                description={item.description || "Choose an action via the wizard"}
                icon={item.icon}
                accentColor={getAppAccent(appKey)}
                draggable
                onDragStart={(e) => {
                  onDragStart(e, { type: "app", label: "Action in an app" });
                  e.dataTransfer.setData("application/flowcraft/app-key", appKey);
                }}
                actionTitle="Add with wizard"
                onAction={() => {
                  if (flowId) openAddAppNode(flowId, appKey);
                }}
              />
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
          <PaletteItem
            label="AI Agent"
            description="Add an agent with Model/Memory/Tools"
            icon="aiAgent"
            accentColor={accentVar.neutral}
            draggable
            onDragStart={(e) => onDragStart(e, { type: "aiAgent", label: "AI Agent" })}
            actionTitle="Add with wizard"
            onAction={() => {
              if (flowId) openAddAgent(flowId);
            }}
          />
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
              .map((item) => (
                <PaletteItem
                  key={item.type}
                  label={item.label}
                  description={item.description}
                  icon={item.type}
                  accentColor={accentVar[item.accent] || "var(--accent)"}
                  draggable
                  onDragStart={(e) => onDragStart(e, { type: item.type, label: item.label })}
                  onAction={() => {
                    const pos = computeCenter();
                    addNode(item.type as BuilderNodeType, pos, item.label);
                  }}
                />
              ))}
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
            {canvasItems.map((item) => (
              <PaletteCanvasItem
                key={item.type}
                label={item.label}
                description={item.description}
                accentColor={accentVar[item.accent] || "var(--accent)"}
                onDragStart={(e) => {
                  e.dataTransfer.setData("application/reactflow/node-type", item.type);
                  e.dataTransfer.setData("application/reactflow/node-label", item.label);
                  e.dataTransfer.effectAllowed = "move";
                }}
              />
            ))}
          </CollapsibleSection>
        ) : null}
      </div>
    </aside>
  );
}
