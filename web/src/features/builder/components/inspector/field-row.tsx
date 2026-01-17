"use client";

import { Input } from "@/components/ui/input";
import { Select, type SelectOption } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Toggle } from "@/components/ui/toggle";
import { NodeField } from "../../types/node-catalog";
import { KeyValueField } from "./fields/KeyValueField";
import { CredentialField } from "./fields/CredentialField";
import { FieldLabel } from "./fields/FieldLabel";

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

  if (field.type === "keyValue") {
    return <KeyValueField field={field} value={value} onChange={onChange} />;
  }

  if (field.type === "textarea") {
    return (
      <div className="space-y-2">
        <FieldLabel field={field} htmlFor={id} />
        <Textarea
          id={id}
          value={String(v)}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-[110px] bg-surface2 font-mono"
          placeholder={field.placeholder}
        />
        {field.helpText ? <div className="text-xs text-muted">{field.helpText}</div> : null}
      </div>
    );
  }

  if (field.type === "select") {
    const options = (field.options || []).map<SelectOption>((opt) => ({ value: opt, label: opt }));
    return (
      <div className="space-y-2">
        <FieldLabel field={field} />
        <Select
          value={String(v)}
          options={options}
          onChange={(next) => onChange(next)}
          placeholder={field.placeholder || "Select..."}
          searchable={options.length > 8}
          searchPlaceholder="Search..."
        />
        {field.helpText ? <div className="text-xs text-muted">{field.helpText}</div> : null}
      </div>
    );
  }

  if (field.type === "credential") {
    return <CredentialField field={field} value={value} onChange={onChange} />;
  }

  if (field.type === "number") {
    return (
      <div className="space-y-2">
        <FieldLabel field={field} htmlFor={id} />
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
          <Toggle checked={checked} onChange={(checked) => onChange(checked)} />
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
      <FieldLabel field={field} htmlFor={id} />
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
