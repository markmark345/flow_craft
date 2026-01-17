"use client";

import { cn } from "@/lib/cn";
import { NodeIcon } from "../node-icon";
import { RuntimeBadge } from "./RuntimeBadge";
import { FlowNodeData } from "../../../types";
import { actionLabelFromConfig, appLabelFromConfig, isAppActionConfigured } from "../../../lib/node-utils";
import { isValidAgentModelConfig } from "../../../types/agent";

type Props = {
  data: FlowNodeData;
  accentColor: string;
  iconBg: string;
  iconRing: string;
  iconNodeType: string;
  runtimeTone?: string;
  meta?: any;
};

export function NodeHeader({ data, accentColor, iconBg, iconRing, iconNodeType, runtimeTone, meta }: Props) {
  const runtimeStatus = data.runtimeStatus;
  const runtimeStepKey = data.runtimeStepKey;

  return (
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
        <RuntimeBadge status={runtimeStatus} stepKey={runtimeStepKey} tone={runtimeTone} />
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
  );
}
