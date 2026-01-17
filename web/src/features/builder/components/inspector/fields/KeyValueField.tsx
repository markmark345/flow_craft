"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import { IconButton } from "@/components/ui/icon-button";
import { coerceKeyValuePairs } from "@/lib/form-utils";
import { NodeField } from "../../../types/node-catalog";
import { FieldLabel } from "./FieldLabel";

interface KeyValueFieldProps {
  field: NodeField;
  value: unknown;
  onChange: (v: unknown) => void;
}

export function KeyValueField({ field, value, onChange }: KeyValueFieldProps) {
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
      <FieldLabel field={field} />
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
            <IconButton
              icon="close"
              className="h-10 w-10 bg-surface2 border border-border text-muted hover:text-red hover:bg-surface transition-colors"
              title="Remove"
              onClick={() => removeAt(idx)}
            />
          </div>
        ))}

        <Button
          variant="ghost"
          className="inline-flex items-center gap-1.5 px-3 py-2 h-auto rounded-lg bg-surface2 border border-border text-xs font-semibold text-muted hover:text-text hover:bg-surface transition-colors"
          onClick={addRow}
        >
          <Icon name="add" className="text-[18px]" />
          {addLabel}
        </Button>

        {field.helpText ? <div className="text-xs text-muted">{field.helpText}</div> : null}
      </div>
    </div>
  );
}
