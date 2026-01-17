"use client";

import { ReactNode } from "react";
import { NodeField } from "../../../types/node-catalog";

interface FieldLabelProps {
  field: NodeField;
  htmlFor?: string;
  children?: ReactNode;
}

export function FieldLabel({ field, htmlFor, children }: FieldLabelProps) {
  const content = (
    <>
      {children || field.label}
      {field.required ? <span className="text-red"> *</span> : null}
    </>
  );

  if (field.type === "select" || field.type === "credential") {
    return <div className="block text-xs font-bold text-muted">{content}</div>;
  }

  return (
    <label htmlFor={htmlFor} className="block text-xs font-bold text-muted">
      {content}
    </label>
  );
}
