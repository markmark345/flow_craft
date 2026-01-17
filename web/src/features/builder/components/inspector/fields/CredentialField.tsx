"use client";

import { Select, type SelectOption } from "@/components/ui/select";
import { useCredentialOptions } from "@/features/credentials/hooks/use-credential-options";
import { NodeField } from "../../../types/node-catalog";
import { FieldLabel } from "./FieldLabel";

interface CredentialFieldProps {
  field: NodeField;
  value: unknown;
  onChange: (v: unknown) => void;
}

export function CredentialField({ field, value, onChange }: CredentialFieldProps) {
  const { options, loading, error } = useCredentialOptions(field.provider, true);
  const selectOptions = options.map<SelectOption>((opt) => ({
    value: opt.id,
    label: opt.label,
    description: opt.accountEmail ? `${opt.provider} • ${opt.accountEmail}` : opt.provider,
  }));

  return (
    <div className="space-y-2">
      <FieldLabel field={field} />
      <Select
        value={String(value ?? "")}
        options={selectOptions}
        onChange={(next) => onChange(next)}
        placeholder="Select credential..."
        searchable={selectOptions.length > 6}
        searchPlaceholder="Search credentials..."
      />
      {loading ? <div className="text-xs text-muted">Loading credentials...</div> : null}
      {!loading && options.length === 0 ? (
        <div className="text-xs text-muted">No credentials connected yet.</div>
      ) : null}
      {error ? <div className="text-xs text-red">{error}</div> : null}
      {field.helpText ? <div className="text-xs text-muted">{field.helpText}</div> : null}
    </div>
  );
}
