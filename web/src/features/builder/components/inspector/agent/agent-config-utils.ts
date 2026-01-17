"use client";

import { AGENT_TOOL_CATALOG } from "../../../nodeCatalog/catalog";
import { SchemaField } from "@/components/ui/SchemaForm/types";
import { AgentToolConfig } from "../../../types/agent";

export function toolIconFor(toolKey: string) {
  const k = toolKey.toLowerCase();
  if (k.startsWith("gmail.")) return "gmail";
  if (k.startsWith("gsheets.")) return "googleSheets";
  if (k.startsWith("github.")) return "github";
  if (k.startsWith("bannerbear.") || k.startsWith("bananabear.")) return "bannerbear";
  return "app";
}

export function toolSchemaFor(toolKey: string): SchemaField[] {
  const def = AGENT_TOOL_CATALOG.find((t) => t.toolKey === toolKey);
  if (!def) return [];
  return [...(def.baseFields || []), ...(def.fields || [])];
}

export function validateTool(tool: AgentToolConfig): Record<string, string> {
  const def = AGENT_TOOL_CATALOG.find((t) => t.toolKey === tool.toolKey);
  const schema = def ? [...(def.baseFields || []), ...(def.fields || [])] : [];
  const value = {
    credentialId: tool.credentialId || "",
    ...(tool.config || {}),
  } as Record<string, unknown>;
  const errors: Record<string, string> = {};
  for (const field of schema) {
    if (!field.required) continue;
    const v = value[field.key];
    if (typeof v !== "string" || !v.trim()) errors[field.key] = `${field.label} is required`;
  }
  if (def?.app === "bannerbear") {
    const cred = typeof value.credentialId === "string" ? value.credentialId.trim() : "";
    const apiKey = typeof (value as any).apiKey === "string" ? String((value as any).apiKey).trim() : "";
    if (!cred && !apiKey) errors.credentialId = "Select a credential or provide an API key";
  }
  return errors;
}
