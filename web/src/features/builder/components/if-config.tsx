"use client";

import { useMemo } from "react";
import { Input } from "@/shared/components/input";
import { Icon } from "@/shared/components/icon";
import { Select, type SelectOption } from "@/shared/components/select";
import {
  type IfConditionType,
  type IfCombine,
  type IfCondition,
  type IfNodeConfig,
  OPERATORS,
  coerceConditionType,
  coerceCombine,
  coerceIfConfig,
  operatorNeedsValue,
} from "../lib/if-utils";


export function IfConfig({
  config,
  onPatch,
}: {
  config: Record<string, unknown>;
  onPatch: (patch: Record<string, unknown>) => void;
}) {
  const state = useMemo(() => coerceIfConfig(config), [config]);

  const updateCondition = (id: string, patch: Partial<IfCondition>) => {
    const next = state.conditions.map((c) => (c.id === id ? { ...c, ...patch } : c));
    onPatch({ conditions: next });
  };

  const removeCondition = (id: string) => {
    const next = state.conditions.filter((c) => c.id !== id);
    onPatch({ conditions: next.length ? next : [{ id: crypto.randomUUID(), type: "string", operator: "is equal to", left: "", right: "" }] });
  };

  const addCondition = () => {
    onPatch({
      conditions: [
        ...state.conditions,
        { id: crypto.randomUUID(), type: "string", operator: "is equal to", left: "", right: "" },
      ],
    });
  };

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <div className="text-xs font-bold uppercase tracking-wide text-muted">Conditions</div>
        <p className="text-xs text-muted">
          Use <code>input.</code> for the previous output and <code>steps.&lt;nodeId&gt;</code> for other steps
          (shown in the inspector). Wrap right-side paths in <code>{"{{ ... }}"}</code>.
        </p>

        {state.conditions.map((cond) => {
          const needsValue = operatorNeedsValue(cond.type, cond.operator);
          return (
            <div key={cond.id} className="rounded-lg bg-surface2 border border-border p-3 space-y-3">
              <div className="flex items-center gap-2">
                <Select
                  value={cond.type}
                  options={
                    [
                      { value: "string", label: "String" },
                      { value: "number", label: "Number" },
                      { value: "datetime", label: "Date & Time" },
                      { value: "boolean", label: "Boolean" },
                      { value: "array", label: "Array" },
                      { value: "object", label: "Object" },
                    ] satisfies SelectOption[]
                  }
                  onChange={(next) => {
                    const nextType = coerceConditionType(next);
                    const nextOperator = OPERATORS[nextType]?.[0]?.label || "is equal to";
                    updateCondition(cond.id, { type: nextType, operator: nextOperator });
                  }}
                  className="w-[160px]"
                />

                <Select
                  value={cond.operator}
                  options={OPERATORS[cond.type].map<SelectOption>((op) => ({ value: op.label, label: op.label }))}
                  onChange={(next) => updateCondition(cond.id, { operator: next })}
                  className="flex-1"
                  searchable={OPERATORS[cond.type].length > 8}
                  searchPlaceholder="Search operators..."
                />

                <button
                  type="button"
                  className="h-9 w-9 rounded-lg bg-panel border border-border flex items-center justify-center text-muted hover:text-red hover:bg-surface transition-colors"
                  title="Remove condition"
                  onClick={() => removeCondition(cond.id)}
                >
                  <Icon name="close" className="text-[18px]" />
                </button>
              </div>

              <div className="space-y-2">
                <Input
                  value={cond.left}
                  onChange={(e) => updateCondition(cond.id, { left: e.target.value })}
                  placeholder="value1 (e.g. input.status or steps.node_2c0a8.data.name)"
                  className="h-10 rounded-lg bg-panel font-mono"
                />
                {needsValue ? (
                  <Input
                    value={cond.right}
                    onChange={(e) => updateCondition(cond.id, { right: e.target.value })}
                    placeholder="value2 (literal or {{steps.node_2c0a8.data.name}})"
                    className="h-10 rounded-lg bg-panel font-mono"
                  />
                ) : null}
              </div>
            </div>
          );
        })}

        <button
          type="button"
          className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-lg bg-surface2 border border-border text-xs font-semibold text-muted hover:text-text hover:bg-surface transition-colors"
          onClick={addCondition}
        >
          <Icon name="add" className="text-[18px]" />
          Add condition
        </button>
      </div>

      <div className="space-y-2 border-t border-border pt-4">
        <div className="text-xs font-bold uppercase tracking-wide text-muted">Logic</div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-muted">Combine</label>
            <Select
              value={state.combine}
              options={[{ value: "AND", label: "AND" }, { value: "OR", label: "OR" }]}
              onChange={(next) => onPatch({ combine: coerceCombine(next) })}
            />
          </div>
        </div>

        <div className="space-y-2 pt-1">
          <label className="flex items-center cursor-pointer group select-none">
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={state.convertTypes}
                onChange={(e) => onPatch({ convertTypes: e.target.checked })}
              />
              <div className="w-9 h-5 bg-surface peer-focus:outline-none rounded-full peer border border-border peer-checked:bg-accent relative after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
            </div>
            <span className="ml-3 text-xs font-bold text-muted group-hover:text-text transition-colors">
              Convert types where required
            </span>
          </label>

          <label className="flex items-center cursor-pointer group select-none">
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={state.ignoreCase}
                onChange={(e) => onPatch({ ignoreCase: e.target.checked })}
              />
              <div className="w-9 h-5 bg-surface peer-focus:outline-none rounded-full peer border border-border peer-checked:bg-accent relative after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
            </div>
            <span className="ml-3 text-xs font-bold text-muted group-hover:text-text transition-colors">Ignore case</span>
          </label>
        </div>
      </div>
    </div>
  );
}
