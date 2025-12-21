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
  const accentColor = accentVar[accent] || "var(--accent)";
  const isTrigger = meta?.category === "Triggers";
  const addConnectedNode = useBuilderStore((s) => s.addConnectedNode);
  const isValid = meta?.validate ? meta.validate(data.config || {}) : true;
  const runtimeStatus = data.runtimeStatus;
  const runtimeStepKey = data.runtimeStepKey;
  const runtimePulse = data.runtimePulse;

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
  const labelOutsideX = 22;

  const outputHandleClass =
    "!w-3 !h-3 !rounded-full !border-[2.5px] shadow-soft cursor-crosshair transition-transform hover:scale-125 relative " +
    "after:content-['+'] after:absolute after:inset-0 after:flex after:items-center after:justify-center " +
    "after:text-[10px] after:font-bold after:text-text after:pointer-events-none after:opacity-0 group-hover:after:opacity-100";

  const inputHandleClass =
    "!w-3 !h-3 !rounded-full !border-[2.5px] shadow-soft cursor-crosshair transition-transform hover:scale-125";

  const topBar = `linear-gradient(90deg, ${accentColor} 0%, color-mix(in srgb, ${accentColor} 55%, white) 100%)`;
  const iconBg = `color-mix(in srgb, ${accentColor} 14%, transparent)`;
  const iconRing = `color-mix(in srgb, ${accentColor} 22%, transparent)`;

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

  return (
    <div
      className={cn(
        "group relative rounded-xl border bg-panel w-64 transition-all",
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
          className={cn("absolute -inset-1 rounded-xl pointer-events-none", runtimePulse ? "animate-pulse" : "")}
          style={{
            boxShadow: `0 0 0 2px ${accentColor}, 0 0 0 6px color-mix(in srgb, ${accentColor} 18%, transparent)`,
          }}
        />
      ) : null}
      <div className="h-1.5 w-full rounded-t-xl" style={{ background: topBar }} />

      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="p-1.5 rounded-lg border shadow-soft shrink-0"
              style={{ color: accentColor, background: iconBg, borderColor: iconRing }}
            >
              <NodeIcon nodeType={data.nodeType} className="h-[18px] w-[18px]" />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-sm text-text leading-none truncate">{data.label}</div>
              <div className="text-[10px] font-mono text-muted mt-1 truncate">
                {meta?.op || meta?.description || data.description}
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
          ) : null}
        </div>

        {footer}
      </div>

      {!isTrigger && (
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
              style={{ top: ifTrueTop, right: -labelOutsideX }}
            >
              true
            </div>
            <div
              className="absolute text-[10px] text-muted select-none -translate-y-1/2"
              style={{ top: ifFalseTop, right: -labelOutsideX }}
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
            <div className="mt-2 max-h-72 overflow-auto pr-1 space-y-3">
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
