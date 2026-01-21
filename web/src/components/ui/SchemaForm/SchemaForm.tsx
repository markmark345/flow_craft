
"use client";

import type { SchemaField as SchemaFieldType } from "./types";
import { SchemaField } from "./SchemaField";

type Props = {
  schema: SchemaFieldType[];
  value: Record<string, unknown>;
  onPatch: (patch: Record<string, unknown>) => void;
  errors?: Record<string, string>;
};

export function SchemaForm({ schema, value, onPatch, errors }: Props) {
  return (
    <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
      {schema.map((field) => (
        <SchemaField
          key={field.key}
          field={field}
          value={value?.[field.key]}
          error={errors?.[field.key]}
          onChange={(next) => onPatch({ [field.key]: next })}
        />
      ))}
    </form>
  );
}
