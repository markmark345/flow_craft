"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { NodeProps } from "reactflow";
import { FlowNodeData } from "../../types";
import { NODE_CATALOG, NODE_CATEGORIES } from "../../types/node-catalog";
import { cn } from "@/shared/lib/cn";
import { BuilderNodeType } from "../../types";
import { useBuilderStore } from "../../store/use-builder-store";
import { NodeIcon } from "./node-icon";
import { Icon } from "@/shared/components/icon";
import { isValidAgentModelConfig } from "../../types/agent";
import { useWizardStore } from "../../wizard/store/use-wizard-store";
import { appLabelFromConfig, actionLabelFromConfig, isAppActionConfigured } from "../../lib/node-utils";
import { ModelNode } from "./flow-node/ModelNode";
import { AgentSummary } from "./flow-node/AgentSummary";
import { NodePicker } from "./flow-node/NodePicker";
import { NodeHandles } from "./flow-node/NodeHandles";

const accentVar: Record<string, string> = {
  accent: "var(--accent)",
  success: "var(--success)",
  warning: "var(--warning)",
  error: "var(--error)",
  trigger: "var(--trigger)",
  slack: "var(--slack)",
  neutral: "var(--muted)",
};

export function FlowNode({ id, data, selected }: NodeProps<FlowNodeData>) {
  const meta = NODE_CATALOG[data.nodeType];
  const accent = meta?.accent || "accent";
  const baseAccentColor = accentVar[accent] || "var(--accent)";
  const appKey = typeof data.config?.app === "string" ? String(data.config.app).trim().toLowerCase() : "";
  const appTone =
    appKey === "googlesheets" || appKey === "gsheets"
      ? "var(--success)"
      : appKey === "gmail"
        ? "var(--error)"
        : appKey === "bannerbear" || appKey === "bananabear"
          ? "var(--warning)"
          : appKey === "github"
            ? "var(--accent)"
            : baseAccentColor;
  const accentColor = data.nodeType === "app" ? appTone : baseAccentColor;
  const isTrigger = meta?.category === "Triggers";
  const isModelNode =
    data.nodeType === "chatModel" ||
    data.nodeType === "openaiChatModel" ||
    data.nodeType === "geminiChatModel" ||
    data.nodeType === "grokChatModel";
  const hasMainInput = !isTrigger && !isModelNode;
  const addConnectedNode = useBuilderStore((s) => s.addConnectedNode);
  const isValid = meta?.validate ? meta.validate(data) : true;
  const runtimeStatus = data.runtimeStatus;
  const runtimeStepKey = data.runtimeStepKey;
  const runtimePulse = data.runtimePulse;
  const flowId = useBuilderStore((s) => s.flowId);
  const openAddAgentTool = useWizardStore((s) => s.openAddAgentTool);

  const runtimeTone = (() => {
    if (!runtimeStatus) return undefined;
    if (runtimeStatus === "success") return "var(--success)";
    if (runtimeStatus === "failed") return "var(--error)";
    if (runtimeStatus === "running") return accentColor;
    if (runtimeStatus === "canceled") return "var(--muted)";
    return "var(--muted)";
  })();

  const pickerRef = useRef<HTMLDivElement | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [pickerSourceHandle, setPickerSourceHandle] = useState<string | undefined>(undefined);
  const setSelectedNode = useBuilderStore((s) => s.setSelectedNode);
  const setAgentInspectorTab = useBuilderStore((s) => s.setAgentInspectorTab);

  useEffect(() => {
    if (!pickerOpen) return;
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (!pickerRef.current?.contains(target)) setPickerOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [pickerOpen]);

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return NODE_CATEGORIES;
    return NODE_CATEGORIES.map((cat) => ({
      ...cat,
      items: cat.items.filter((item) => {
        const label = item.label.toLowerCase();
        const desc = item.description.toLowerCase();
        return label.includes(q) || desc.includes(q);
      }),
    })).filter((cat) => cat.items.length > 0);
  }, [query]);

  const onQuickAdd = (nodeType: BuilderNodeType) => {
    const sourceHandle = pickerSourceHandle || (data.nodeType === "if" ? "true" : undefined);
    addConnectedNode(id, nodeType, { sourceHandle });
    setPickerOpen(false);
    setQuery("");
  };

  useEffect(() => {
    if (!selected) setPickerOpen(false);
  }, [selected]);

  const isIf = data.nodeType === "if";
  const branchOffsetPx = 14;
  const ifTrueTop = `calc(50% - ${branchOffsetPx}px)`;
  const ifFalseTop = `calc(50% + ${branchOffsetPx}px)`;
  const popupTop = isIf ? (pickerSourceHandle === "false" ? ifFalseTop : ifTrueTop) : "50%";

  const handleOutsideX = 6;
  const labelOutsideX = 18;

  const outputHandleClass =
    "!w-3 !h-3 !rounded-full !border-[2.5px] shadow-soft cursor-crosshair transition-transform hover:scale-125 relative " +
    "after:content-['+'] after:absolute after:inset-0 after:flex after:items-center after:justify-center " +
    "after:text-[10px] after:font-bold after:text-text after:pointer-events-none after:opacity-0 group-hover:after:opacity-100";

  const inputHandleClass =
    "!w-3 !h-3 !rounded-full !border-[2.5px] shadow-soft cursor-crosshair transition-transform hover:scale-125";

  const topBar = `linear-gradient(90deg, ${accentColor} 0%, color-mix(in srgb, ${accentColor} 55%, white) 100%)`;
  const iconBg = `color-mix(in srgb, ${accentColor} 14%, transparent)`;
  const iconRing = `color-mix(in srgb, ${accentColor} 22%, transparent)`;

  if (isModelNode) {
    return <ModelNode data={data} selected={selected} handleOutsideX={handleOutsideX} />;
  }

  const iconNodeType = (() => {
    if (data.nodeType !== "app") return data.nodeType;
    if (appKey === "googlesheets" || appKey === "gsheets" || appKey === "googlesheet") return "googleSheets";
    if (appKey === "gmail") return "gmail";
    if (appKey === "github") return "github";
    if (appKey === "bannerbear" || appKey === "bananabear") return "bannerbear";
    return "app";
  })();

  const footer = (() => {
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
  })();

  const handleAgentTabOpen = (tab: "model" | "memory" | "tools") => {
    setSelectedNode(id);
    setAgentInspectorTab(tab);
  };

  const handleAddAgentTool = () => {
    if (!flowId) return;
    openAddAgentTool(flowId, id);
  };

  const handlePickerHandleClick = (sourceHandle?: string) => {
    setPickerSourceHandle(sourceHandle);
    setPickerOpen(true);
  };

  return (
    <div
      className={cn(
        "group relative border bg-panel transition-all",
        data.nodeType === "app" || data.nodeType === "aiAgent" ? "w-72" : "w-64",
        data.nodeType === "app" || data.nodeType === "aiAgent" ? "rounded-2xl" : "rounded-xl",
        selected ? "shadow-lift" : "shadow-soft hover:shadow-lift"
      )}
      style={{
        borderColor: selected
          ? "transparent"
          : runtimeTone
            ? `color-mix(in srgb, ${runtimeTone} 45%, var(--border))`
            : "color-mix(in srgb, var(--border) 70%, transparent)",
        boxShadow: selected
          ? `0 0 0 2px ${accentColor}, var(--shadow-lift)`
          : runtimeTone
            ? `0 0 0 2px color-mix(in srgb, ${runtimeTone} 55%, transparent), var(--shadow-soft)`
            : undefined,
      }}
    >
      {runtimeStatus === "running" ? (
        <div
          className={cn(
            "absolute -inset-1 pointer-events-none",
            data.nodeType === "app" || data.nodeType === "aiAgent" ? "rounded-2xl" : "rounded-xl",
            runtimePulse ? "animate-pulse" : ""
          )}
          style={{
            boxShadow: `0 0 0 2px ${accentColor}, 0 0 0 6px color-mix(in srgb, ${accentColor} 18%, transparent)`,
          }}
        />
      ) : null}
      <div
        className={cn(
          "h-1.5 w-full",
          data.nodeType === "app" || data.nodeType === "aiAgent" ? "rounded-t-2xl" : "rounded-t-xl"
        )}
        style={{ background: topBar }}
      />

      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="p-1.5 rounded-lg border shadow-soft shrink-0"
              style={{ color: accentColor, background: iconBg, borderColor: iconRing }}
            >
              <NodeIcon nodeType={iconNodeType} className="h-[18px] w-[18px]" />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-sm text-text leading-none truncate">
                {data.nodeType === "app" ? actionLabelFromConfig(data.config) || data.label : data.label}
              </div>
              <div
                className={cn(
                  "mt-1 truncate",
                  data.nodeType === "app" || data.nodeType === "aiAgent"
                    ? "text-[11px] text-muted"
                    : "text-[10px] font-mono text-muted"
                )}
              >
                {data.nodeType === "app"
                  ? appLabelFromConfig(data.config) || "App Action"
                  : data.nodeType === "aiAgent"
                    ? meta?.description || "AI Agent"
                    : meta?.op || meta?.description || data.description}
              </div>
            </div>
          </div>
          {runtimeStatus ? (
            <div
              className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold border"
              style={{
                background: `color-mix(in srgb, ${runtimeTone || "var(--muted)"} 14%, transparent)`,
                borderColor: `color-mix(in srgb, ${runtimeTone || "var(--muted)"} 24%, transparent)`,
                color: runtimeTone || "var(--muted)",
              }}
              title={runtimeStepKey ? `${runtimeStepKey} ${runtimeStatus}` : runtimeStatus}
            >
              {runtimeStatus === "running" ? "Running" : runtimeStatus}
            </div>
          ) : data.nodeType === "app" ? (
            !isAppActionConfigured(data.config || {}) ? (
              <div className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold border text-red border-red/30 bg-red/10">
                Needs setup
              </div>
            ) : null
          ) : data.nodeType === "aiAgent" ? (
            !isValidAgentModelConfig(data.model) ? (
              <div className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold border text-red border-red/30 bg-red/10">
                Model required
              </div>
            ) : null
          ) : null}
        </div>

        {footer}
        <AgentSummary
          data={data}
          nodeId={id}
          flowId={flowId}
          onOpenTab={handleAgentTabOpen}
          onAddTool={handleAddAgentTool}
        />
      </div>

      <NodeHandles
        hasMainInput={hasMainInput}
        isIf={isIf}
        accentColor={accentColor}
        handleOutsideX={handleOutsideX}
        labelOutsideX={labelOutsideX}
        ifTrueTop={ifTrueTop}
        ifFalseTop={ifFalseTop}
        inputHandleClass={inputHandleClass}
        outputHandleClass={outputHandleClass}
        pickerRef={pickerRef}
        onHandleClick={handlePickerHandleClick}
      />

      <NodePicker
        isOpen={pickerOpen}
        query={query}
        groups={groups}
        popupTop={popupTop}
        accentVar={accentVar}
        onQueryChange={setQuery}
        onQuickAdd={onQuickAdd}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}
