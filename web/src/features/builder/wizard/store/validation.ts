
import { AppKey, findAppAction } from "../../nodeCatalog/catalog";

export function validateRequiredString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0;
}

export function validateSchema(schema: Array<{ key: string; label: string; required?: boolean }>, config: Record<string, unknown>) {
  const errors: Record<string, string> = {};
  for (const field of schema) {
    if (!field.required) continue;
    if (!validateRequiredString(config[field.key])) errors[field.key] = `${field.label} is required`;
  }
  return errors;
}

export function validateCredentialRequirement(app: AppKey, config: Record<string, unknown>) {
  const credentialId = typeof config.credentialId === "string" ? config.credentialId.trim() : "";
  const apiKey = typeof (config as any).apiKey === "string" ? String((config as any).apiKey).trim() : "";
  if (app === "bannerbear") {
    if (!credentialId && !apiKey) return { credentialId: "Select a credential or provide an API key" };
    return {};
  }
  if (!credentialId) return { credentialId: "Credential is required" };
  return {};
}
