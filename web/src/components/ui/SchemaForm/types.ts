export type SchemaFieldType =
  | "text"
  | "number"
  | "textarea"
  | "json"
  | "select"
  | "toggle"
  | "keyValue"
  | "credential";

export type SchemaField = {
  key: string;
  label: string;
  type: SchemaFieldType;
  placeholder?: string;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
  options?: string[];
  required?: boolean;
  helpText?: string;
  provider?: string;
};
