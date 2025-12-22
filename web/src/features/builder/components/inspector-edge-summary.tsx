"use client";

import { Icon } from "@/shared/components/icon";

export function InspectorEdgeSummary({
  sourceLabel,
  targetLabel,
}: {
  sourceLabel: string;
  targetLabel: string;
}) {
  return (
    <div className="space-y-3">
      <div className="text-xs font-bold uppercase tracking-wide text-muted">Selected edge</div>
      <div className="rounded-lg bg-surface2 border border-border p-3">
        <div className="text-[11px] font-bold uppercase tracking-wide text-muted">From</div>
        <div className="text-sm text-text truncate">{sourceLabel}</div>
        <div className="flex items-center gap-2 text-muted my-2">
          <Icon name="trending_flat" className="text-[18px]" />
          <div className="h-px flex-1 bg-border" />
        </div>
        <div className="text-[11px] font-bold uppercase tracking-wide text-muted">To</div>
        <div className="text-sm text-text truncate">{targetLabel}</div>
      </div>
      <div className="text-xs text-muted">Tip: press Delete/Backspace or double-click the edge to remove it.</div>
    </div>
  );
}
