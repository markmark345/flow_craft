"use client";

import { Input } from "@/shared/components/input";
import { Icon } from "@/shared/components/icon";
import { NodeField } from "../types/node-catalog";

export function FieldRow({
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
