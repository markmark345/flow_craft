import type { SchemaField } from "@/shared/components/SchemaForm/types";

import { bannerbearApp } from "./apps/bannerbear";
import { gmailApp } from "./apps/gmail";
import { githubApp } from "./apps/github";
import { googleSheetsApp } from "./apps/googleSheets";

export type AppKey = "googleSheets" | "gmail" | "github" | "bannerbear";

export type AppCatalogActionKind = "action" | "trigger";

export type AppCatalogAction = {
  actionKey: string;
  label: string;
  description: string;
  fields: SchemaField[];
  supportsTest: boolean;
  disabled?: boolean;
  kind?: AppCatalogActionKind;
};

export type AppCatalogCategory = {
  key: string;
  label: string;
  items: AppCatalogAction[];
};

export type AppCatalogApp = {
  appKey: AppKey;
  label: string;
  description: string;
  icon: string;
  baseFields: SchemaField[];
  categories: AppCatalogCategory[];
};

export const APP_CATALOG: Record<AppKey, AppCatalogApp> = {
  googleSheets: googleSheetsApp,
  gmail: gmailApp,
  github: githubApp,
  bannerbear: bannerbearApp,
};

export function normalizeAppKey(value: unknown): AppKey | null {
  const v = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (!v) return null;
  if (v === "gsheets" || v === "google-sheets" || v === "googlesheets" || v === "googlesheet") return "googleSheets";
  if (v === "gmail") return "gmail";
  if (v === "github") return "github";
  if (v === "bannerbear" || v === "bananabear") return "bannerbear";
  return null;
}

export type AppActionListItem = AppCatalogAction & {
  appKey: AppKey;
  appLabel: string;
  appIcon: string;
  categoryKey: string;
  categoryLabel: string;
};

export function listAppActions(appKey: AppKey): AppActionListItem[] {
  const app = APP_CATALOG[appKey];
  return app.categories.flatMap((cat) =>
    cat.items.map((action) => ({
      ...action,
      appKey: app.appKey,
      appLabel: app.label,
      appIcon: app.icon,
      categoryKey: cat.key,
      categoryLabel: cat.label,
    }))
  );
}

export function findAppAction(appKey: AppKey, actionKey: string): AppActionListItem | null {
  const trimmed = String(actionKey || "").trim();
  if (!trimmed) return null;
  const items = listAppActions(appKey);
  return items.find((a) => a.actionKey === trimmed) || null;
}

export function defaultActionKeyForApp(appKey: AppKey): string {
  const items = listAppActions(appKey);
  const preferred = items.find((a) => !a.disabled && (a.kind || "action") === "action");
  return preferred?.actionKey || items[0]?.actionKey || "";
}

export function appSchemaFor(appKey: AppKey, actionKey: string): SchemaField[] {
  const app = APP_CATALOG[appKey];
  const action = findAppAction(appKey, actionKey);
  return [...(app.baseFields || []), ...((action?.fields as SchemaField[]) || [])];
}

export type AgentToolDef = {
  toolKey: string;
  label: string;
  description?: string;
  app: AppKey;
  actionKey: string;
  kind?: AppCatalogActionKind;
  disabled?: boolean;
  supportsTest: boolean;
  baseFields: SchemaField[];
  fields: SchemaField[];
};

export const AGENT_TOOL_CATALOG: AgentToolDef[] = (Object.values(APP_CATALOG) as AppCatalogApp[]).flatMap((app) =>
  listAppActions(app.appKey).map((action) => ({
    toolKey: action.actionKey,
    label: action.label,
    description: action.description,
    app: app.appKey,
    actionKey: action.actionKey,
    kind: action.kind,
    disabled: action.disabled,
    supportsTest: action.supportsTest,
    baseFields: app.baseFields,
    fields: action.fields,
  }))
);

export type ModelProvider = "openai" | "gemini" | "grok" | "custom";

export type AgentModelConfig = {
  provider: ModelProvider;
  credentialId?: string;
  apiKeyOverride?: string;
  model: string;
  baseUrl?: string;
};

export const MODEL_PROVIDERS: Array<{ key: ModelProvider; label: string; defaultModel: string; defaultBaseUrl: string }> = [
  { key: "openai", label: "OpenAI", defaultModel: "gpt-4o-mini", defaultBaseUrl: "https://api.openai.com/v1" },
  { key: "gemini", label: "Gemini", defaultModel: "gemini-1.5-flash", defaultBaseUrl: "https://generativelanguage.googleapis.com" },
  { key: "grok", label: "Grok", defaultModel: "grok-2-latest", defaultBaseUrl: "https://api.x.ai/v1" },
  { key: "custom", label: "Custom", defaultModel: "model", defaultBaseUrl: "" },
];

export function validateAgentModelConfig(cfg: Partial<AgentModelConfig> | null | undefined) {
  if (!cfg) return false;
  const provider = typeof cfg.provider === "string" ? cfg.provider.trim() : "";
  const model = typeof cfg.model === "string" ? cfg.model.trim() : "";
  const credentialId = typeof cfg.credentialId === "string" ? cfg.credentialId.trim() : "";
  const apiKeyOverride = typeof cfg.apiKeyOverride === "string" ? cfg.apiKeyOverride.trim() : "";
  return provider.length > 0 && model.length > 0 && (credentialId.length > 0 || apiKeyOverride.length > 0);
}
