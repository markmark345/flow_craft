
import { BuilderNodeType, FlowNodeData } from "@/features/builder/types";

export type NodeFieldType = "text" | "number" | "textarea" | "select" | "toggle" | "keyValue" | "credential" | "password";

export type NodeField = {
  key: string;
  label: string;
  type: NodeFieldType;
  placeholder?: string;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
  options?: string[];
  required?: boolean;
  helpText?: string;
  provider?: string;
};

export type NodeCategory = "Triggers" | "Actions" | "Utilities";

export type NodeAccent = "accent" | "success" | "warning" | "error" | "trigger" | "slack" | "neutral";

export type NodeCatalogItem = {
  type: BuilderNodeType;
  label: string;
  category: NodeCategory;
  description: string;
  accent: NodeAccent;
  op?: string;
  validate?: (node: FlowNodeData) => boolean;
  fields: NodeField[];
  defaultConfig: Record<string, unknown>;
};
