/**
 * Run-specific utility functions
 * Provides utilities for run status, step visualization, and log processing
 */

import type { ReactElement } from "react";
import { Icon } from "@/components/ui/icon";
import { RunStepDTO } from "@/types/dto";
import { pretty } from "@/lib/string-utils";

/**
 * Get status icon component for run step
 * @param status - Step status
 * @returns Icon JSX element with appropriate styling
 */
export function stepStatusIcon(status: RunStepDTO["status"]): ReactElement {
  if (status === "success") return <Icon name="check_circle" className="text-[18px] text-green" />;
  if (status === "failed") return <Icon name="error" className="text-[18px] text-red" />;
  if (status === "running") return <Icon name="refresh" className="text-[18px] text-warning" />;
  if (status === "canceled") return <Icon name="close" className="text-[18px] text-muted" />;
  if (status === "skipped") return <Icon name="remove" className="text-[18px] text-muted" />;
  return <span className="size-4 rounded-full border border-border bg-surface inline-block" />;
}

/**
 * Get badge tone for step status
 * @param status - Step status
 * @returns Badge tone variant
 */
export function stepTone(status?: RunStepDTO["status"]): "default" | "success" | "warning" | "danger" {
  if (status === "success") return "success";
  if (status === "failed") return "danger";
  if (status === "running" || status === "queued") return "warning";
  return "default";
}

/**
 * Get tab content text for run step
 * @param step - Run step data
 * @param tab - Active tab name
 * @param runLog - Optional run-level log
 * @returns Formatted text content for the tab
 */
export function tabText(
  step: RunStepDTO | undefined,
  tab: "inputs" | "outputs" | "logs" | "errors",
  runLog?: string
): string {
  if (!step) return "";
  if (tab === "inputs") return pretty(step.inputs);
  if (tab === "outputs") return pretty(step.outputs);
  if (tab === "logs") return [step.log, runLog].filter(Boolean).join("\n");
  return step.error || (step.status === "failed" ? "Step failed" : "");
}

/**
 * Filter log text by search query
 * @param text - Log text to filter
 * @param query - Search query
 * @returns Filtered log text with only matching lines
 */
export function filterLogText(text: string, query: string): string {
  const q = query.trim().toLowerCase();
  if (!q) return text;
  const lines = text.split("\n");
  const filtered = lines.filter((l) => l.toLowerCase().includes(q));
  return filtered.join("\n");
}

/**
 * Truncate ID for display
 */
export function shortId(id: string) {
  if (id.length <= 12) return id;
  return `${id.slice(0, 8)}…${id.slice(-4)}`;
}

export { parseTime, cutoffFor, formatDate, formatRelative, formatDuration } from "@/lib/date-utils";
