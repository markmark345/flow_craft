/**
 * IF node configuration utilities
 * Provides utilities for IF condition parsing, validation, and coercion
 */

import { toStringValue } from "@/shared/lib/string-utils";

export type IfConditionType = "string" | "number" | "datetime" | "boolean" | "array" | "object";
export type IfCombine = "AND" | "OR";

export type IfCondition = {
  id: string;
  type: IfConditionType;
  operator: string;
  left: string;
  right: string;
};

export type IfNodeConfig = {
  combine: IfCombine;
  conditions: IfCondition[];
  ignoreCase: boolean;
  convertTypes: boolean;
};

/**
 * Check if value is a record object
 * @param value - Value to check
 * @returns True if value is a record object
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

/**
 * Coerce value to valid IF condition type
 * @param value - Value to coerce
 * @returns Valid IfConditionType
 */
export function coerceConditionType(value: unknown): IfConditionType {
  if (
    value === "string" ||
    value === "number" ||
    value === "datetime" ||
    value === "boolean" ||
    value === "array" ||
    value === "object"
  ) {
    return value;
  }
  return "string";
}

/**
 * Coerce value to valid combine operator
 * @param value - Value to coerce
 * @returns Valid IfCombine ("AND" or "OR")
 */
export function coerceCombine(value: unknown): IfCombine {
  return value === "OR" ? "OR" : "AND";
}

/**
 * Coerce value to array of IF conditions
 * @param raw - Value to coerce
 * @returns Array of valid IF conditions
 */
export function coerceConditions(raw: unknown): IfCondition[] {
  if (!Array.isArray(raw)) {
    return [
      {
        id: crypto.randomUUID(),
        type: "string",
        operator: "is equal to",
        left: "",
        right: "",
      },
    ];
  }

  const out: IfCondition[] = [];
  for (const item of raw) {
    if (!isRecord(item)) continue;
    const id = typeof item.id === "string" && item.id ? item.id : crypto.randomUUID();
    out.push({
      id,
      type: coerceConditionType(item.type),
      operator: typeof item.operator === "string" && item.operator ? item.operator : "is equal to",
      left: toStringValue(item.left),
      right: toStringValue(item.right),
    });
  }

  return out.length
    ? out
    : [
        {
          id: crypto.randomUUID(),
          type: "string",
          operator: "is equal to",
          left: "",
          right: "",
        },
      ];
}

/**
 * Coerce config object to valid IF node configuration
 * @param config - Raw config object
 * @returns Valid IfNodeConfig
 */
export function coerceIfConfig(config: Record<string, unknown>): IfNodeConfig {
  return {
    combine: coerceCombine(config.combine),
    conditions: coerceConditions(config.conditions),
    ignoreCase: Boolean(config.ignoreCase),
    convertTypes: Boolean(config.convertTypes),
  };
}

/**
 * Available operators for each condition type
 */
export const OPERATORS: Record<IfConditionType, Array<{ label: string; needsValue: boolean }>> = {
    string: [
      { label: "exists", needsValue: false },
      { label: "does not exist", needsValue: false },
      { label: "is empty", needsValue: false },
      { label: "is not empty", needsValue: false },
      { label: "is equal to", needsValue: true },
      { label: "is not equal to", needsValue: true },
      { label: "contains", needsValue: true },
      { label: "does not contain", needsValue: true },
      { label: "starts with", needsValue: true },
      { label: "does not start with", needsValue: true },
      { label: "ends with", needsValue: true },
      { label: "does not end with", needsValue: true },
      { label: "matches regex", needsValue: true },
      { label: "does not match regex", needsValue: true },
    ],
    number: [
      { label: "exists", needsValue: false },
      { label: "does not exist", needsValue: false },
      { label: "is equal to", needsValue: true },
      { label: "is not equal to", needsValue: true },
      { label: "is greater than", needsValue: true },
      { label: "is less than", needsValue: true },
      { label: "is greater than or equal to", needsValue: true },
      { label: "is less than or equal to", needsValue: true },
    ],
    datetime: [
      { label: "exists", needsValue: false },
      { label: "does not exist", needsValue: false },
      { label: "is equal to", needsValue: true },
      { label: "is not equal to", needsValue: true },
      { label: "is after", needsValue: true },
      { label: "is before", needsValue: true },
      { label: "is after or equal to", needsValue: true },
      { label: "is before or equal to", needsValue: true },
    ],
    boolean: [
      { label: "exists", needsValue: false },
      { label: "does not exist", needsValue: false },
      { label: "is true", needsValue: false },
      { label: "is false", needsValue: false },
    ],
    array: [
      { label: "exists", needsValue: false },
      { label: "does not exist", needsValue: false },
      { label: "is empty", needsValue: false },
      { label: "is not empty", needsValue: false },
      { label: "contains", needsValue: true },
      { label: "does not contain", needsValue: true },
      { label: "length equal to", needsValue: true },
      { label: "length not equal to", needsValue: true },
      { label: "length greater than", needsValue: true },
      { label: "length less than", needsValue: true },
      { label: "length greater than or equal to", needsValue: true },
      { label: "length less than or equal to", needsValue: true },
    ],
    object: [
      { label: "exists", needsValue: false },
      { label: "does not exist", needsValue: false },
      { label: "is empty", needsValue: false },
      { label: "is not empty", needsValue: false },
    ],
};

/**
 * Check if operator requires a right-hand value
 * @param type - Condition type
 * @param operator - Operator string
 * @returns True if operator needs value
 */
export function operatorNeedsValue(type: IfConditionType, operator: string): boolean {
  return Boolean(OPERATORS[type]?.find((o) => o.label === operator)?.needsValue);
}
