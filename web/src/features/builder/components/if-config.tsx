"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import { Toggle } from "@/components/ui/toggle";
import { Select, type SelectOption } from "@/components/ui/select";
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

                <IconButton
                  icon="close"
                  className="h-9 w-9 border border-border bg-panel text-muted hover:text-red hover:bg-surface transition-colors"
                  title="Remove condition"
                  onClick={() => removeCondition(cond.id)}
                />
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

        <Button
          variant="ghost"
          className="w-full gap-2 h-10 bg-surface2 border border-border text-xs font-semibold text-muted hover:text-text hover:bg-surface transition-colors"
          onClick={addCondition}
        >
          <Icon name="add" className="text-[18px]" />
          Add condition
        </Button>
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
          <div className="flex items-center group select-none">
            <Toggle
              checked={state.convertTypes}
              onChange={(checked) => onPatch({ convertTypes: checked })}
            />
            <span className="ml-3 text-xs font-bold text-muted group-hover:text-text transition-colors cursor-pointer" onClick={() => onPatch({ convertTypes: !state.convertTypes })}>
              Convert types where required
            </span>
          </div>

          <div className="flex items-center group select-none">
            <Toggle
              checked={state.ignoreCase}
              onChange={(checked) => onPatch({ ignoreCase: checked })}
            />
            <span className="ml-3 text-xs font-bold text-muted group-hover:text-text transition-colors cursor-pointer" onClick={() => onPatch({ ignoreCase: !state.ignoreCase })}>
              Ignore case
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
