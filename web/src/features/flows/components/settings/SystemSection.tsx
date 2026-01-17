"use client";

import { API_BASE_URL } from "@/lib/env";

type Props = {};

export function SystemSection() {
  return (
    <section className="bg-panel border border-border rounded-xl shadow-soft overflow-hidden">
      <div className="px-6 py-5 border-b border-border">
        <h3 className="text-lg font-semibold text-text">System</h3>
      </div>
      <div className="p-6 space-y-3 text-sm">
        <Row label="Version" value="v0.1.0-beta" />
        <Row label="API base" value={API_BASE_URL} mono />
        <Row label="Environment" value="Local" badgeTone="warning" />
        <Row label="Temporal NS" value="default" mono />
      </div>
    </section>
  );
}

function Row({
  label,
  value,
  mono,
  badgeTone,
}: {
  label: string;
  value: string;
  mono?: boolean;
  badgeTone?: "default" | "success" | "warning" | "danger";
}) {
  const toneVar: Record<NonNullable<typeof badgeTone>, string> = {
    default: "var(--muted)",
    success: "var(--success)",
    warning: "var(--warning)",
    danger: "var(--error)",
  };
  const c = badgeTone ? toneVar[badgeTone] : "var(--text)";
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="text-xs text-muted uppercase tracking-wide">{label}</div>
      {badgeTone ? (
        <span
          className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium border"
          style={{
            background: `color-mix(in srgb, ${c} 14%, transparent)`,
            borderColor: `color-mix(in srgb, ${c} 24%, transparent)`,
            color: c,
          }}
        >
          {value}
        </span>
      ) : (
        <div className={`text-sm text-text truncate ${mono ? "font-mono text-xs" : ""}`}>{value}</div>
      )}
    </div>
  );
}
