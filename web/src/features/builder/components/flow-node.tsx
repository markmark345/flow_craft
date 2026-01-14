"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Handle, NodeProps, Position } from "reactflow";
import { FlowNodeData } from "../types";
import { NODE_CATALOG, NODE_CATEGORIES } from "../types/node-catalog";
import { cn } from "@/shared/lib/cn";
import { Input } from "@/shared/components/input";
import { BuilderNodeType } from "../types";
import { useBuilderStore } from "../store/use-builder-store";
import { NodeIcon } from "./node-icon";
import { Icon } from "@/shared/components/icon";
import { isValidAgentModelConfig, type AgentMemoryConfig, type AgentToolConfig } from "../types/agent";
import { APP_CATALOG, findAppAction, normalizeAppKey } from "../nodeCatalog/catalog";
import { useWizardStore } from "../wizard/store/use-wizard-store";
import { appLabelFromConfig, actionLabelFromConfig, isAppActionConfigured } from "../lib/node-utils";

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
    const ringTone = isValid ? providerTone : "var(--error)";

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

        <div className="mt-2 text-xs font-bold text-text text-center max-w-32 truncate">{data.label || `${providerLabel} Chat Model`}</div>
        <div className="text-[10px] text-muted text-center max-w-32 truncate">{modelName || providerLabel}</div>
      </div>
    );
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

  const agentSummary = (() => {
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

    const openTab = (tab: "model" | "memory" | "tools") => {
      setSelectedNode(id);
      setAgentInspectorTab(tab);
    };

    return (
      <div className="mt-4 pt-4 border-t border-border space-y-2">
        <div className="text-[10px] font-bold uppercase tracking-wider text-muted">Attachments</div>

        <div className="flex items-center gap-3">
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
          <div
            role="button"
            tabIndex={0}
            onClick={() => openTab("model")}
            onKeyDown={(e) => {
              if (e.key !== "Enter" && e.key !== " ") return;
              e.preventDefault();
              openTab("model");
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

        <div className="flex items-center gap-3">
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
          <div
            role="button"
            tabIndex={0}
            onClick={() => openTab("memory")}
            onKeyDown={(e) => {
              if (e.key !== "Enter" && e.key !== " ") return;
              e.preventDefault();
              openTab("memory");
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

        <div className="flex items-center gap-3">
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
          <div
            role="button"
            tabIndex={0}
            onClick={() => openTab("tools")}
            onKeyDown={(e) => {
              if (e.key !== "Enter" && e.key !== " ") return;
              e.preventDefault();
              openTab("tools");
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
                  if (!flowId) return;
                  openAddAgentTool(flowId, id);
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
  })();

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
                {data.nodeType === "app"
                  ? actionLabelFromConfig(data.config) || data.label
                  : data.label}
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
        {agentSummary}
      </div>

      {hasMainInput && (
        <Handle
          type="target"
          position={Position.Left}
          className={inputHandleClass}
          style={{
            background: "var(--panel)",
            borderColor: "color-mix(in srgb, var(--border) 60%, transparent)",
            left: -handleOutsideX,
            top: "50%",
            transform: "translate(0, -50%)",
          }}
        />
      )}

      <div ref={pickerRef}>
        {isIf ? (
          <>
            <Handle
              id="true"
              type="source"
              position={Position.Right}
              className={outputHandleClass}
              style={{
                background: "var(--panel)",
                borderColor: accentColor,
                top: ifTrueTop,
                right: -handleOutsideX,
                transform: "translate(0, -50%)",
              }}
              onClick={(e) => {
                e.stopPropagation();
                setPickerSourceHandle("true");
                setPickerOpen(true);
              }}
              title="Add / connect (true)"
            />
            <Handle
              id="false"
              type="source"
              position={Position.Right}
              className={outputHandleClass}
              style={{
                background: "var(--panel)",
                borderColor: "var(--muted)",
                top: ifFalseTop,
                right: -handleOutsideX,
                transform: "translate(0, -50%)",
              }}
              onClick={(e) => {
                e.stopPropagation();
                setPickerSourceHandle("false");
                setPickerOpen(true);
              }}
              title="Add / connect (false)"
            />
            <div
              className="absolute text-[10px] text-muted select-none -translate-y-1/2"
              style={{ top: ifTrueTop, left: `calc(100% + ${labelOutsideX}px)` }}
            >
              true
            </div>
            <div
              className="absolute text-[10px] text-muted select-none -translate-y-1/2"
              style={{ top: ifFalseTop, left: `calc(100% + ${labelOutsideX}px)` }}
            >
              false
            </div>
          </>
        ) : (
          <Handle
            type="source"
            position={Position.Right}
            className={outputHandleClass}
            style={{
              background: "var(--panel)",
              borderColor: accentColor,
              right: -handleOutsideX,
              top: "50%",
              transform: "translate(0, -50%)",
            }}
            onClick={(e) => {
              e.stopPropagation();
              setPickerSourceHandle(undefined);
              setPickerOpen(true);
            }}
            title="Add / connect"
          />
        )}

        {pickerOpen && (
          <div
            className="absolute right-10 -translate-y-1/2 w-64 rounded-xl border border-border bg-panel shadow-lift p-2"
            style={{ top: popupTop }}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Add node..."
              className="h-9"
              autoFocus
            />
            <div className="mt-2 max-h-72 overflow-auto pr-1 space-y-3 fc-scrollbar">
              {groups.length === 0 ? (
                <div className="text-xs text-muted px-2 py-2">No matches</div>
              ) : (
                groups.map((cat) => (
                  <div key={cat.id} className="space-y-1">
                    <div className="text-[10px] uppercase tracking-wide text-muted px-1">
                      {cat.label}
                    </div>
                    <div className="space-y-1">
                      {cat.items.map((item) => (
                        <button
                          key={item.type}
                          type="button"
                          className="w-full text-left rounded-md border border-border bg-surface px-2 py-1.5 hover:border-accent transition flex items-center gap-2"
                          onClick={() => onQuickAdd(item.type)}
                        >
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ background: accentVar[item.accent] || "var(--accent)" }}
                          />
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-text leading-5">
                              {item.label}
                            </div>
                            <div className="text-xs text-muted truncate">{item.description}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
