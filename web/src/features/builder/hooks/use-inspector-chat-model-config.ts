import { useMemo } from "react";
import type { SelectOption } from "@/components/ui/select";

type Provider = "openai" | "gemini" | "grok";

function normalizeProvider(value: unknown): Provider {
  const v = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (v === "gemini" || v === "grok" || v === "openai") return v;
  return "openai";
}

function getProviderDefaults(provider: Provider): { model: string; baseUrl: string } {
  switch (provider) {
    case "gemini":
      return { model: "gemini-1.5-flash", baseUrl: "https://generativelanguage.googleapis.com" };
    case "grok":
      return { model: "grok-2-latest", baseUrl: "https://api.x.ai/v1" };
    case "openai":
    default:
      return { model: "gpt-4o-mini", baseUrl: "https://api.openai.com/v1" };
  }
}

export interface UseInspectorChatModelConfigReturn {
  provider: Provider;
  defaults: { model: string; baseUrl: string };
  credentialId: string;
  apiKey: string;
  model: string;
  baseUrl: string;
  providerOptions: SelectOption[];
  credentialOptions: SelectOption[];
  invalid: boolean;
}

import type { CredentialOption } from "@/features/credentials/hooks/use-credential-options";

/**
 * Custom hook for managing chat model configuration in inspector.
 * Handles provider selection, credential options, and validation.
 */
export function useInspectorChatModelConfig(
  config: Record<string, unknown>,
  credentialOptionsData: { options: CredentialOption[]; loading: boolean; error: string | null }
): UseInspectorChatModelConfigReturn {
  const provider = normalizeProvider(config?.provider);
  const defaults = getProviderDefaults(provider);

  const credentialId = typeof config?.credentialId === "string" ? config.credentialId : "";
  const apiKey = typeof config?.apiKey === "string" ? config.apiKey : "";
  const model = typeof config?.model === "string" ? config.model : "";
  const baseUrl = typeof config?.baseUrl === "string" ? config.baseUrl : "";

  const providerOptions = useMemo<SelectOption[]>(
    () => [
      { value: "openai", label: "OpenAI", description: "OpenAI-compatible (OpenAI API)" },
      { value: "gemini", label: "Gemini", description: "Google Generative Language API" },
      { value: "grok", label: "Grok", description: "xAI (OpenAI-compatible)" },
    ],
    []
  );

  const credentialOptions = useMemo<SelectOption[]>(
    () =>
      credentialOptionsData.options.map((opt) => ({
        value: opt.id,
        label: opt.label,
        description: opt.accountEmail ? `${opt.provider} • ${opt.accountEmail}` : opt.provider,
      })),
    [credentialOptionsData.options]
  );

  const invalid = !model.trim() || (!credentialId.trim() && !apiKey.trim());

  return {
    provider,
    defaults,
    credentialId,
    apiKey,
    model,
    baseUrl,
    providerOptions,
    credentialOptions,
    invalid,
  };
}
