
import { BuilderNodeType } from "@/features/builder/types";
import { NodeCatalogItem } from "../definitions";

export const logic: Record<string, NodeCatalogItem> = {
  delay: {
    type: "delay",
    label: "Delay",
    category: "Utilities",
    description: "Wait before continuing",
    accent: "warning",
    op: "util.delay",
    fields: [{ key: "seconds", label: "Seconds", type: "number", placeholder: "5" }],
    defaultConfig: { seconds: 5 },
  },
  if: {
    type: "if",
    label: "If",
    category: "Utilities",
    description: "Branch based on conditions",
    accent: "neutral",
    op: "logic.condition",
    fields: [],
    defaultConfig: {
      combine: "AND",
      conditions: [{ id: "cond_1", type: "string", operator: "is equal to", left: "", right: "" }],
      ignoreCase: false,
      convertTypes: false,
    },
    validate: (node) => {
      const cfg = node.config as Record<string, unknown>;
      const raw = cfg?.conditions;
      if (!Array.isArray(raw) || raw.length === 0) return false;
      const first = raw[0];
      if (!first || typeof first !== "object") return false;
      const left = "left" in (first as any) ? String((first as any).left || "").trim() : "";
      const operator = "operator" in (first as any) ? String((first as any).operator || "").trim() : "";
      return left.length > 0 && operator.length > 0;
    },
  },
  merge: {
    type: "merge",
    label: "Merge",
    category: "Utilities",
    description: "Combine outputs from multiple steps",
    accent: "accent",
    op: "util.merge",
    fields: [],
    defaultConfig: {},
  },
  switch: {
    type: "switch",
    label: "Switch",
    category: "Utilities",
    description: "Route based on a value",
    accent: "accent",
    op: "logic.switch",
    fields: [{ key: "expression", label: "Expression", type: "text", placeholder: "input.status" }],
    defaultConfig: { expression: "" },
  },
};
