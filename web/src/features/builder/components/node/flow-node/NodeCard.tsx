"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { FlowNodeData } from "../../../types";

type Props = {
  data: FlowNodeData;
  selected: boolean;
  accentColor: string;
  runtimeTone?: string;
  topBar: string;
  children: ReactNode;
};

export function NodeCard({ data, selected, accentColor, runtimeTone, topBar, children }: Props) {
  const runtimeStatus = data.runtimeStatus;
  const runtimePulse = data.runtimePulse;

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
      {children}
    </div>
  );
}
