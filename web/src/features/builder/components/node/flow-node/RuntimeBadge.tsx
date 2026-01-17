"use client";

import { cn } from "@/lib/cn";

type Props = {
  status?: string;
  stepKey?: string;
  tone?: string;
};

export function RuntimeBadge({ status, stepKey, tone }: Props) {
  if (!status) return null;

  return (
    <div
      className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold border"
      style={{
        background: `color-mix(in srgb, ${tone || "var(--muted)"} 14%, transparent)`,
        borderColor: `color-mix(in srgb, ${tone || "var(--muted)"} 24%, transparent)`,
        color: tone || "var(--muted)",
      }}
      title={stepKey ? `${stepKey} ${status}` : status}
    >
      {status === "running" ? "Running" : status}
    </div>
  );
}
