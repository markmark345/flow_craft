"use client";

import { Badge } from "@/shared/components/badge";
import { Button } from "@/shared/components/button";
import { Input } from "@/shared/components/input";
import { RunStepDTO } from "@/shared/types/dto";
import { useEffect, useMemo, useRef, useState } from "react";
import { useBuilderStore } from "../store/use-builder-store";
import { NODE_CATALOG, NodeField } from "../types/node-catalog";
import { NodeIcon } from "./node-icon";
import { useAppStore } from "@/shared/hooks/use-app-store";
import { Icon } from "@/shared/components/icon";
import { useRunStepsStore } from "@/features/runs/store/use-run-steps-store";
import { IfConfig } from "./if-config";

export function Inspector() {
  const [tab, setTab] = useState("config");
  const selectedNodeId = useBuilderStore((s) => s.selectedNodeId);
  const selectedEdgeId = useBuilderStore((s) => s.selectedEdgeId);
  const nodes = useBuilderStore((s) => s.nodes);
  const edges = useBuilderStore((s) => s.edges);
  const activeRunId = useBuilderStore((s) => s.activeRunId);
  const updateNodeData = useBuilderStore((s) => s.updateNodeData);
  const updateNodeConfig = useBuilderStore((s) => s.updateNodeConfig);
  const deleteNode = useBuilderStore((s) => s.deleteNode);
  const duplicateNode = useBuilderStore((s) => s.duplicateNode);

  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedNodeId),
    [nodes, selectedNodeId]
  );
  const selectedEdge = useMemo(() => edges.find((e) => e.id === selectedEdgeId), [edges, selectedEdgeId]);

  useEffect(() => {
    if (!selectedEdge) return;
    setTab("io");
  }, [selectedEdgeId, selectedEdge]);

  const steps =
    useRunStepsStore((s) => (activeRunId ? s.stepsByRunId[activeRunId] : undefined)) || [];
  const stepByNodeId = useMemo(() => {
    const map = new Map<string, RunStepDTO>();
    for (const step of steps) {
      if (step.nodeId) map.set(step.nodeId, step);
    }
    return map;
  }, [steps]);

  const selectedNodeStep = selectedNode ? stepByNodeId.get(selectedNode.id) : undefined;
  const sourceNode = selectedEdge ? nodes.find((n) => n.id === selectedEdge.source) : undefined;
  const targetNode = selectedEdge ? nodes.find((n) => n.id === selectedEdge.target) : undefined;
  const sourceStep = selectedEdge ? stepByNodeId.get(selectedEdge.source) : undefined;
  const targetStep = selectedEdge ? stepByNodeId.get(selectedEdge.target) : undefined;

  const meta = selectedNode ? NODE_CATALOG[selectedNode.data.nodeType] : undefined;
  const valid = selectedNode && meta?.validate ? meta.validate(selectedNode.data.config || {}) : true;
  const nodeCode = selectedNode ? `node_${selectedNode.id.slice(0, 5)}` : "";
  const accent = meta?.accent || "accent";
  const accentVar: Record<string, string> = {
    accent: "var(--accent)",
    success: "var(--success)",
    warning: "var(--warning)",
    error: "var(--error)",
    trigger: "var(--trigger)",
    slack: "var(--slack)",
    neutral: "var(--muted)",
  };
  const accentColor = accentVar[accent] || "var(--accent)";

  return (
    <aside className="w-80 bg-panel border-l border-border flex flex-col z-20 shadow-[0_4px_24px_-12px_rgba(0,0,0,0.1)]">
      <div className="flex border-b border-border bg-surface2">
        <button
          type="button"
          className={`flex-1 py-3 text-xs font-bold ${
            tab === "config" ? "text-accent border-b-2 border-accent bg-panel" : "text-muted hover:text-text"
          }`}
          onClick={() => setTab("config")}
        >
          Configuration
        </button>
        <button
          type="button"
          className={`flex-1 py-3 text-xs font-bold ${
            tab === "io" ? "text-accent border-b-2 border-accent bg-panel" : "text-muted hover:text-text"
          }`}
          onClick={() => setTab("io")}
        >
          Input / Output
        </button>
        <button
          type="button"
          className={`flex-1 py-3 text-xs font-bold ${
            tab === "notes" ? "text-accent border-b-2 border-accent bg-panel" : "text-muted hover:text-text"
          }`}
          onClick={() => setTab("notes")}
        >
          Notes
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        {!selectedNode && !selectedEdge ? (
          <div className="text-sm text-muted">Select a node or edge.</div>
        ) : tab === "config" ? (
          selectedNode ? (
            <div className="space-y-6">
              <div className="flex items-start gap-4 pb-5 border-b border-border">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border shadow-soft"
                  style={{
                    color: accentColor,
                    background: `color-mix(in srgb, ${accentColor} 12%, transparent)`,
                    borderColor: `color-mix(in srgb, ${accentColor} 20%, transparent)`,
                  }}
                >
                  <NodeIcon nodeType={selectedNode.data.nodeType} className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-text truncate">{meta?.label || "Node"}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-1.5 py-0.5 rounded bg-surface2 text-[10px] font-mono text-muted border border-border">
                      {nodeCode}
                    </span>
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${valid ? "bg-green" : "bg-red"}`}
                      title={valid ? "Valid configuration" : "Needs configuration"}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-muted">Label</label>
                <Input
                  value={selectedNode.data.label}
                  onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value })}
                  className="h-10 rounded-lg bg-surface2"
                />
              </div>

            {selectedNode.data.nodeType === "slack" ? (
              <SlackConfig
                config={selectedNode.data.config || {}}
                onPatch={(patch) => updateNodeConfig(selectedNode.id, patch)}
              />
            ) : selectedNode.data.nodeType === "cron" ? (
              <ScheduleConfig
                config={selectedNode.data.config || {}}
                onPatch={(patch) => updateNodeConfig(selectedNode.id, patch)}
              />
            ) : selectedNode.data.nodeType === "if" ? (
              <IfConfig
                config={selectedNode.data.config || {}}
                onPatch={(patch) => updateNodeConfig(selectedNode.id, patch)}
              />
            ) : (
              <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                {meta?.fields.map((field) => (
                  <FieldRow
                    key={field.key}
                      field={field}
                      value={selectedNode.data.config?.[field.key]}
                      onChange={(v) => updateNodeConfig(selectedNode.id, { [field.key]: v })}
                    />
                  ))}
                </form>
              )}

              <div className="space-y-2 pt-4 border-t border-border">
                <div className="text-xs font-bold uppercase tracking-wide text-muted">Failure handling</div>
                <FieldRow
                  field={{
                    key: "continueOnFail",
                    label: "Continue on fail",
                    type: "toggle",
                    helpText: "When enabled, the workflow continues even if this node errors.",
                  }}
                  value={selectedNode.data.config?.continueOnFail}
                  onChange={(v) => updateNodeConfig(selectedNode.id, { continueOnFail: v })}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wide text-muted">Selected edge</div>
              <div className="rounded-lg bg-surface2 border border-border p-3">
                <div className="text-[11px] font-bold uppercase tracking-wide text-muted">From</div>
                <div className="text-sm text-text truncate">{sourceNode?.data.label || selectedEdge?.source}</div>
                <div className="flex items-center gap-2 text-muted my-2">
                  <Icon name="trending_flat" className="text-[18px]" />
                  <div className="h-px flex-1 bg-border" />
                </div>
                <div className="text-[11px] font-bold uppercase tracking-wide text-muted">To</div>
                <div className="text-sm text-text truncate">{targetNode?.data.label || selectedEdge?.target}</div>
              </div>
              <div className="text-xs text-muted">Tip: press Delete/Backspace or double-click the edge to remove it.</div>
            </div>
          )
        ) : tab === "io" ? (
          selectedNode ? (
            <div className="space-y-5">
              {activeRunId ? (
                selectedNodeStep ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-xs font-bold uppercase tracking-wide text-muted">Last run</div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-mono text-muted">{selectedNodeStep.stepKey}</span>
                        <Badge label={selectedNodeStep.status} tone={stepTone(selectedNodeStep.status)} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-xs font-bold uppercase tracking-wide text-muted">Inputs</div>
                      <pre className="text-xs whitespace-pre break-words rounded-lg bg-surface2 border border-border p-3 font-mono text-text overflow-auto max-h-[24vh]">
                        {pretty(selectedNodeStep.inputs) || "—"}
                      </pre>
                    </div>

                    <div className="space-y-2">
                      <div className="text-xs font-bold uppercase tracking-wide text-muted">Outputs</div>
                      <pre className="text-xs whitespace-pre break-words rounded-lg bg-surface2 border border-border p-3 font-mono text-text overflow-auto max-h-[24vh]">
                        {pretty(selectedNodeStep.outputs) || "—"}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-muted">No run data for this node yet.</div>
                )
              ) : (
                <div className="text-sm text-muted">Run the flow to see input/output.</div>
              )}

              <div className="space-y-2 pt-2 border-t border-border">
                <div className="text-xs font-bold uppercase tracking-wide text-muted">Current config</div>
                <pre className="text-xs whitespace-pre-wrap rounded-lg bg-surface2 border border-border p-3 font-mono text-text">
                  {JSON.stringify(selectedNode.data.config, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {!activeRunId ? (
                <div className="text-sm text-muted">Run the flow to see input/output.</div>
              ) : null}

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs font-bold uppercase tracking-wide text-muted">From</div>
                  {sourceStep ? (
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-mono text-muted">{sourceStep.stepKey}</span>
                      <Badge label={sourceStep.status} tone={stepTone(sourceStep.status)} />
                    </div>
                  ) : null}
                </div>
                <div className="text-sm text-text truncate">{sourceNode?.data.label || selectedEdge?.source}</div>
                <pre className="text-xs whitespace-pre break-words rounded-lg bg-surface2 border border-border p-3 font-mono text-text overflow-auto max-h-[22vh]">
                  {pretty(sourceStep?.outputs) || "—"}
                </pre>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs font-bold uppercase tracking-wide text-muted">To</div>
                  {targetStep ? (
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-mono text-muted">{targetStep.stepKey}</span>
                      <Badge label={targetStep.status} tone={stepTone(targetStep.status)} />
                    </div>
                  ) : null}
                </div>
                <div className="text-sm text-text truncate">{targetNode?.data.label || selectedEdge?.target}</div>

                <div className="space-y-2">
                  <div className="text-[11px] font-bold uppercase tracking-wide text-muted">Inputs</div>
                  <pre className="text-xs whitespace-pre break-words rounded-lg bg-surface2 border border-border p-3 font-mono text-text overflow-auto max-h-[18vh]">
                    {pretty(targetStep?.inputs) || "—"}
                  </pre>
                </div>

                <div className="space-y-2">
                  <div className="text-[11px] font-bold uppercase tracking-wide text-muted">Outputs</div>
                  <pre className="text-xs whitespace-pre break-words rounded-lg bg-surface2 border border-border p-3 font-mono text-text overflow-auto max-h-[18vh]">
                    {pretty(targetStep?.outputs) || "—"}
                  </pre>
                </div>
              </div>
            </div>
          )
        ) : (
          selectedNode ? (
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wide text-muted">Notes</div>
              <textarea
                value={selectedNode.data.notes || ""}
                onChange={(e) => updateNodeData(selectedNode.id, { notes: e.target.value })}
                className="w-full min-h-[160px] rounded-lg bg-surface2 border border-border px-3 py-2 text-sm text-text placeholder:text-muted focus:outline-none focus:shadow-focus"
                placeholder="Add notes for this node"
              />
            </div>
          ) : (
            <div className="text-sm text-muted">Notes are only available for nodes.</div>
          )
        )}
      </div>

      {selectedNode ? (
        <div className="p-4 border-t border-border bg-surface2">
          <div className="flex gap-3">
            <Button
              variant="secondary"
              size="sm"
              className="flex-1 flex items-center justify-center"
              onClick={() => duplicateNode(selectedNode.id)}
            >
              Duplicate
            </Button>
            <Button
              variant="danger"
              size="sm"
              className="flex-1 flex items-center justify-center"
              onClick={() => deleteNode(selectedNode.id)}
            >
              Delete
            </Button>
          </div>
        </div>
      ) : null}
    </aside>
  );
}

function stepTone(status?: RunStepDTO["status"]) {
  if (status === "success") return "success";
  if (status === "failed") return "danger";
  if (status === "running" || status === "queued") return "warning";
  return "default";
}

function pretty(value: unknown) {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function FieldRow({
  field,
  value,
  onChange,
}: {
  field: NodeField;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const id = `field-${field.key}`;
  const v = value ?? "";

  const label = (
    <label htmlFor={id} className="block text-xs font-bold text-muted">
      {field.label}
      {field.required ? <span className="text-red"> *</span> : null}
    </label>
  );

  if (field.type === "keyValue") {
    const pairs = coerceKeyValuePairs(value);
    const rows = pairs.length ? pairs : [{ key: "", value: "" }];
    const keyPlaceholder = field.keyPlaceholder || "Key";
    const valuePlaceholder = field.valuePlaceholder || "Value";
    const addLabel = `Add ${field.label.endsWith("s") ? field.label.slice(0, -1) : field.label}`;

    const updateAt = (idx: number, patch: Partial<{ key: string; value: string }>) => {
      const base = pairs.length ? pairs : [{ key: "", value: "" }];
      const next = base.map((row, i) => (i === idx ? { ...row, ...patch } : row));
      onChange(next);
    };

    const removeAt = (idx: number) => {
      const base = pairs.length ? pairs : [{ key: "", value: "" }];
      const next = base.filter((_, i) => i !== idx);
      onChange(next);
    };

    const addRow = () => onChange([...(pairs || []), { key: "", value: "" }]);

    return (
      <div className="space-y-2">
        {label}
        <div className="space-y-2">
          {rows.map((row, idx) => (
            <div key={`${field.key}-${idx}`} className="flex gap-2 items-center">
              <Input
                value={row.key}
                onChange={(e) => updateAt(idx, { key: e.target.value })}
                placeholder={keyPlaceholder}
                className="h-10 rounded-lg bg-surface2 font-mono"
              />
              <Input
                value={row.value}
                onChange={(e) => updateAt(idx, { value: e.target.value })}
                placeholder={valuePlaceholder}
                className="h-10 rounded-lg bg-surface2 font-mono"
              />
              <button
                type="button"
                className="h-10 w-10 rounded-lg bg-surface2 border border-border flex items-center justify-center text-muted hover:text-red hover:bg-surface transition-colors"
                title="Remove"
                onClick={() => removeAt(idx)}
              >
                <Icon name="close" className="text-[18px]" />
              </button>
            </div>
          ))}

          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface2 border border-border text-xs font-semibold text-muted hover:text-text hover:bg-surface transition-colors"
            onClick={addRow}
          >
            <Icon name="add" className="text-[18px]" />
            {addLabel}
          </button>

          {field.helpText ? <div className="text-xs text-muted">{field.helpText}</div> : null}
        </div>
      </div>
    );
  }

  if (field.type === "textarea") {
    return (
      <div className="space-y-2">
        {label}
        <textarea
          id={id}
          value={String(v)}
          onChange={(e) => onChange(e.target.value)}
          className="w-full min-h-[110px] rounded-lg bg-surface2 border border-border px-3 py-2 text-sm text-text placeholder:text-muted focus:outline-none focus:shadow-focus font-mono"
          placeholder={field.placeholder}
        />
        {field.helpText ? <div className="text-xs text-muted">{field.helpText}</div> : null}
      </div>
    );
  }

  if (field.type === "select") {
    return (
      <div className="space-y-2">
        {label}
        <select
          id={id}
          value={String(v)}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-full rounded-lg bg-surface2 border border-border px-3 text-sm text-text focus:outline-none focus:shadow-focus"
        >
          {(field.options || []).map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        {field.helpText ? <div className="text-xs text-muted">{field.helpText}</div> : null}
      </div>
    );
  }

  if (field.type === "number") {
    return (
      <div className="space-y-2">
        {label}
        <Input
          id={id}
          type="number"
          value={String(v)}
          onChange={(e) => onChange(Number(e.target.value))}
          placeholder={field.placeholder}
          className="h-10 rounded-lg bg-surface2"
        />
        {field.helpText ? <div className="text-xs text-muted">{field.helpText}</div> : null}
      </div>
    );
  }

  if (field.type === "toggle") {
    const checked = Boolean(v);
    return (
      <div className="pt-2">
        <label className="flex items-center cursor-pointer group select-none">
          <div className="relative">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={checked}
              onChange={(e) => onChange(e.target.checked)}
            />
            <div className="w-9 h-5 bg-surface peer-focus:outline-none rounded-full peer border border-border peer-checked:bg-accent relative after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
          </div>
          <span className="ml-3 text-xs font-bold text-muted group-hover:text-text transition-colors">
            {field.label}
          </span>
        </label>
        {field.helpText ? <div className="text-xs text-muted mt-1">{field.helpText}</div> : null}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {label}
      <Input
        id={id}
        value={String(v)}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        className="h-10 rounded-lg bg-surface2"
      />
      {field.helpText ? <div className="text-xs text-muted">{field.helpText}</div> : null}
    </div>
  );
}

function coerceKeyValuePairs(value: unknown): Array<{ key: string; value: string }> {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (!item || typeof item !== "object") return undefined;
        const key = "key" in item ? String((item as any).key || "") : "";
        const val = "value" in item ? toStringValue((item as any).value) : "";
        return { key, value: val };
      })
      .filter(Boolean) as Array<{ key: string; value: string }>;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed || trimmed === "{}") return [];
    try {
      const parsed = JSON.parse(trimmed);
      return coerceKeyValuePairs(parsed);
    } catch {
      return [];
    }
  }

  if (typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).map(([k, v]) => ({
      key: k,
      value: toStringValue(v),
    }));
  }

  return [];
}

function toStringValue(value: unknown) {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

type ScheduleMode = "every" | "hourly" | "daily" | "weekly" | "monthly" | "cron";

type ScheduleState = {
  mode: ScheduleMode;
  everyMinutes: number;
  minute: number;
  hour: number;
  days: number[];
  dayOfMonth: number;
  cron: string;
};

function ScheduleConfig({
  config,
  onPatch,
}: {
  config: Record<string, unknown>;
  onPatch: (patch: Record<string, unknown>) => void;
}) {
  const expr = typeof config.expression === "string" ? config.expression : "";
  const [state, setState] = useState<ScheduleState>(() => parseScheduleExpression(expr));

  useEffect(() => {
    setState(parseScheduleExpression(expr));
  }, [expr]);

  const apply = (patch: Partial<ScheduleState>) => {
    const next = { ...state, ...patch };
    const nextExpr = scheduleStateToExpression(next);
    setState(next);
    onPatch({ expression: nextExpr });
  };

  const timeValue = `${String(state.hour).padStart(2, "0")}:${String(state.minute).padStart(2, "0")}`;

  const dayLabels: Array<{ id: number; label: string }> = [
    { id: 1, label: "Mon" },
    { id: 2, label: "Tue" },
    { id: 3, label: "Wed" },
    { id: 4, label: "Thu" },
    { id: 5, label: "Fri" },
    { id: 6, label: "Sat" },
    { id: 0, label: "Sun" },
  ];

  const toggleDay = (day: number) => {
    const set = new Set(state.days);
    if (set.has(day)) set.delete(day);
    else set.add(day);
    const nextDays = Array.from(set);
    nextDays.sort((a, b) => a - b);
    apply({ days: nextDays.length ? nextDays : [1] });
  };

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <label className="block text-xs font-bold text-muted">Schedule</label>
        <div className="relative">
          <select
            className="h-10 w-full rounded-lg bg-surface2 border border-border px-3 text-sm text-text focus:outline-none focus:shadow-focus appearance-none"
            value={state.mode}
            onChange={(e) => apply({ mode: e.target.value as ScheduleMode })}
          >
            <option value="every">Every N minutes</option>
            <option value="hourly">Hourly</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="cron">Cron (advanced)</option>
          </select>
          <Icon name="expand_more" className="absolute right-3 top-2.5 text-muted pointer-events-none text-[20px]" />
        </div>
      </div>

      {state.mode === "every" ? (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-muted">Every (minutes)</label>
            <Input
              type="number"
              min={1}
              max={59}
              value={String(state.everyMinutes)}
              onChange={(e) => apply({ everyMinutes: clampInt(Number(e.target.value), 1, 59) })}
              className="h-10 rounded-lg bg-surface2 font-mono"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-bold text-muted">Preview</label>
            <div className="h-10 rounded-lg bg-surface2 border border-border px-3 flex items-center text-xs font-mono text-muted">
              {scheduleStateToExpression(state)}
            </div>
          </div>
        </div>
      ) : null}

      {state.mode === "hourly" ? (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-muted">At minute</label>
            <Input
              type="number"
              min={0}
              max={59}
              value={String(state.minute)}
              onChange={(e) => apply({ minute: clampInt(Number(e.target.value), 0, 59) })}
              className="h-10 rounded-lg bg-surface2 font-mono"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-bold text-muted">Preview</label>
            <div className="h-10 rounded-lg bg-surface2 border border-border px-3 flex items-center text-xs font-mono text-muted">
              {scheduleStateToExpression(state)}
            </div>
          </div>
        </div>
      ) : null}

      {state.mode === "daily" || state.mode === "weekly" || state.mode === "monthly" ? (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-muted">At time</label>
            <Input
              type="time"
              value={timeValue}
              onChange={(e) => {
                const [h, m] = parseTimeHHMM(e.target.value);
                apply({ hour: h, minute: m });
              }}
              className="h-10 rounded-lg bg-surface2 font-mono"
            />
          </div>

          {state.mode === "monthly" ? (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-muted">Day of month</label>
              <Input
                type="number"
                min={1}
                max={31}
                value={String(state.dayOfMonth)}
                onChange={(e) => apply({ dayOfMonth: clampInt(Number(e.target.value), 1, 31) })}
                className="h-10 rounded-lg bg-surface2 font-mono"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-muted">Preview</label>
              <div className="h-10 rounded-lg bg-surface2 border border-border px-3 flex items-center text-xs font-mono text-muted">
                {scheduleStateToExpression(state)}
              </div>
            </div>
          )}
        </div>
      ) : null}

      {state.mode === "weekly" ? (
        <div className="space-y-2">
          <label className="block text-xs font-bold text-muted">Days</label>
          <div className="flex flex-wrap gap-2">
            {dayLabels.map((d) => {
              const active = state.days.includes(d.id);
              return (
                <button
                  key={d.id}
                  type="button"
                  className={`px-2.5 py-1 rounded-lg border text-xs font-semibold transition-colors ${
                    active ? "bg-accent text-white border-accent" : "bg-surface2 text-muted border-border hover:bg-surface"
                  }`}
                  onClick={() => toggleDay(d.id)}
                >
                  {d.label}
                </button>
              );
            })}
          </div>
          <div className="text-[11px] text-muted font-mono">{scheduleStateToExpression(state)}</div>
        </div>
      ) : null}

      {state.mode === "monthly" ? (
        <div className="space-y-2">
          <div className="text-xs font-bold uppercase tracking-wide text-muted">Preview</div>
          <div className="text-[11px] text-muted font-mono">{scheduleStateToExpression(state)}</div>
        </div>
      ) : null}

      {state.mode === "cron" ? (
        <div className="space-y-2">
          <label className="block text-xs font-bold text-muted">Cron expression</label>
          <Input
            value={state.cron}
            onChange={(e) => apply({ cron: e.target.value })}
            placeholder="0 * * * *"
            className="h-10 rounded-lg bg-surface2 font-mono"
          />
          <div className="text-[11px] text-muted">Format: minute hour day month weekday</div>
        </div>
      ) : null}
    </div>
  );
}

function clampInt(v: number, min: number, max: number) {
  if (!Number.isFinite(v)) return min;
  return Math.max(min, Math.min(max, Math.trunc(v)));
}

function parseTimeHHMM(v: string): [number, number] {
  const [hRaw, mRaw] = v.split(":");
  const h = clampInt(Number(hRaw), 0, 23);
  const m = clampInt(Number(mRaw), 0, 59);
  return [h, m];
}

function parseScheduleExpression(expression: string): ScheduleState {
  const raw = String(expression || "").trim();
  if (!raw) {
    return {
      mode: "hourly",
      everyMinutes: 5,
      minute: 0,
      hour: 0,
      days: [1],
      dayOfMonth: 1,
      cron: "",
    };
  }

  const parts = raw.split(/\s+/).filter(Boolean);
  const p = parts.length === 6 ? parts.slice(1) : parts;
  if (p.length !== 5) {
    return {
      mode: "cron",
      everyMinutes: 5,
      minute: 0,
      hour: 0,
      days: [1],
      dayOfMonth: 1,
      cron: raw,
    };
  }

  const [minPart, hourPart, domPart, monPart, dowPart] = p;
  const base: ScheduleState = {
    mode: "cron",
    everyMinutes: 5,
    minute: 0,
    hour: 0,
    days: [1],
    dayOfMonth: 1,
    cron: raw,
  };

  if (monPart !== "*") return base;

  if (minPart === "*" && hourPart === "*" && domPart === "*" && dowPart === "*") {
    return { ...base, mode: "every", everyMinutes: 1 };
  }

  const everyMatch = minPart.match(/^\*\/(\d{1,2})$/);
  if (everyMatch && hourPart === "*" && domPart === "*" && dowPart === "*") {
    return { ...base, mode: "every", everyMinutes: clampInt(Number(everyMatch[1]), 1, 59) };
  }

  const minNum = toInt(minPart);
  const hourNum = toInt(hourPart);
  const domNum = toInt(domPart);

  if (minNum != null && hourPart === "*" && domPart === "*" && dowPart === "*") {
    return { ...base, mode: "hourly", minute: clampInt(minNum, 0, 59) };
  }

  if (minNum != null && hourNum != null && domPart === "*" && dowPart === "*") {
    return {
      ...base,
      mode: "daily",
      minute: clampInt(minNum, 0, 59),
      hour: clampInt(hourNum, 0, 23),
    };
  }

  if (minNum != null && hourNum != null && domPart === "*" && dowPart !== "*") {
    const days = parseDowList(dowPart);
    return {
      ...base,
      mode: "weekly",
      minute: clampInt(minNum, 0, 59),
      hour: clampInt(hourNum, 0, 23),
      days: days.length ? days : [1],
    };
  }

  if (minNum != null && hourNum != null && domNum != null && dowPart === "*") {
    return {
      ...base,
      mode: "monthly",
      minute: clampInt(minNum, 0, 59),
      hour: clampInt(hourNum, 0, 23),
      dayOfMonth: clampInt(domNum, 1, 31),
    };
  }

  return base;
}

function toInt(v: string) {
  if (!/^\d+$/.test(v)) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function parseDowList(v: string): number[] {
  const parts = v.split(",").map((p) => p.trim()).filter(Boolean);
  const out: number[] = [];
  for (const p of parts) {
    const n = toInt(p);
    if (n == null) continue;
    out.push(clampInt(n, 0, 6));
  }
  const unique = Array.from(new Set(out));
  unique.sort((a, b) => a - b);
  return unique;
}

function scheduleStateToExpression(state: ScheduleState): string {
  const minute = clampInt(state.minute, 0, 59);
  const hour = clampInt(state.hour, 0, 23);
  const dom = clampInt(state.dayOfMonth, 1, 31);

  switch (state.mode) {
    case "every": {
      const n = clampInt(state.everyMinutes, 1, 59);
      if (n === 1) return "* * * * *";
      return `*/${n} * * * *`;
    }
    case "hourly":
      return `${minute} * * * *`;
    case "daily":
      return `${minute} ${hour} * * *`;
    case "weekly": {
      const days = (state.days || []).map((d) => clampInt(d, 0, 6));
      const unique = Array.from(new Set(days)).sort((a, b) => a - b);
      const dow = unique.length ? unique.join(",") : "1";
      return `${minute} ${hour} * * ${dow}`;
    }
    case "monthly":
      return `${minute} ${hour} ${dom} * *`;
    case "cron":
    default:
      return String(state.cron || "").trim();
  }
}

function SlackConfig({
  config,
  onPatch,
}: {
  config: Record<string, unknown>;
  onPatch: (patch: Record<string, unknown>) => void;
}) {
  const showInfo = useAppStore((s) => s.showInfo);
  const messageRef = useRef<HTMLTextAreaElement | null>(null);
  const message = typeof config.message === "string" ? config.message : "";

  const insertVar = (token: string) => {
    const el = messageRef.current;
    if (!el) {
      onPatch({ message: `${message}${token}` });
      return;
    }
    const start = el.selectionStart ?? message.length;
    const end = el.selectionEnd ?? start;
    const next = `${message.slice(0, start)}${token}${message.slice(end)}`;
    onPatch({ message: next });
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + token.length, start + token.length);
    });
  };

  return (
    <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-muted">Action Type</label>
        <div className="relative">
          <select
            className="w-full appearance-none bg-surface2 border border-border text-text text-sm rounded-lg focus:outline-none focus:shadow-focus py-2 px-3 shadow-soft"
            value={String(config.actionType || "Post Message")}
            onChange={(e) => onPatch({ actionType: e.target.value })}
          >
            <option>Post Message</option>
            <option>Upload File</option>
            <option>Create Channel</option>
          </select>
          <Icon
            name="expand_more"
            className="absolute right-3 top-2.5 text-muted pointer-events-none text-[20px]"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-muted">
          Slack Connection <span className="text-red">*</span>
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <select
              className="w-full appearance-none bg-surface2 border border-border text-text text-sm rounded-lg focus:outline-none focus:shadow-focus py-2 px-3 shadow-soft"
              value={String(config.connection || "My Workspace (Default)")}
              onChange={(e) => onPatch({ connection: e.target.value })}
            >
              <option>My Workspace (Default)</option>
              <option>Marketing Team</option>
            </select>
            <Icon
              name="expand_more"
              className="absolute right-3 top-2.5 text-muted pointer-events-none text-[20px]"
            />
          </div>
          <button
            type="button"
            className="p-2 rounded-lg bg-surface2 text-muted hover:text-accent hover:bg-surface border border-border transition-colors"
            title="Add connection (coming soon)"
            onClick={() => showInfo("Connections", "Connection management is coming soon.")}
          >
            <Icon name="add" className="text-[20px]" />
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <label className="block text-xs font-bold text-muted">
            Channel ID <span className="text-red">*</span>
          </label>
          <button
            type="button"
            className="text-[10px] text-accent hover:underline font-medium"
            onClick={() => showInfo("Channel picker", "Channel picker is coming soon.")}
          >
            Select from list
          </button>
        </div>
        <div className="relative">
          <Input
            value={String(config.channelId || "")}
            onChange={(e) => onPatch({ channelId: e.target.value })}
            placeholder="#vip-orders"
            className="h-10 rounded-lg bg-surface2 font-mono pr-10"
          />
          <button
            type="button"
            className="absolute right-1.5 top-1.5 p-1 text-muted hover:text-accent hover:bg-surface rounded transition-colors"
            title="Insert variable (coming soon)"
            onClick={() => showInfo("Variables", "Variable picker is coming soon.")}
          >
            <Icon name="data_object" className="text-[18px]" />
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <label className="block text-xs font-bold text-muted">
            Message Text <span className="text-red">*</span>
          </label>
          <span className="text-[10px] text-muted">Markdown supported</span>
        </div>
        <div className="relative group">
          <textarea
            ref={messageRef}
            value={message}
            onChange={(e) => onPatch({ message: e.target.value })}
            className="w-full bg-surface2 border border-border text-text text-sm rounded-lg focus:outline-none focus:shadow-focus font-mono text-xs leading-relaxed p-3 shadow-soft hover:border-border transition-colors resize-none"
            placeholder="Enter your message..."
            rows={8}
          />
          <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              className="p-1 rounded hover:bg-surface text-muted bg-panel shadow-soft border border-border"
              title="Expand (coming soon)"
              onClick={() => showInfo("Expand", "Expanded editor is coming soon.")}
            >
              <Icon name="open_in_full" className="text-[16px]" />
            </button>
          </div>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {[
            { label: "trigger.id", token: "{{trigger.id}}" },
            { label: "trigger.total", token: "{{trigger.total}}" },
          ].map((v) => (
            <button
              key={v.label}
              type="button"
              className="px-2 py-0.5 rounded bg-surface2 text-[10px] font-mono border border-border hover:bg-surface transition-colors"
              onClick={() => insertVar(v.token)}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      <FieldRow
        field={{ key: "sendAsBot", label: "Send as bot user", type: "toggle" }}
        value={config.sendAsBot}
        onChange={(v) => onPatch({ sendAsBot: v })}
      />
    </form>
  );
}
