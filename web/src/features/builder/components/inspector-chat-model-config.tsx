"use client";

import { useMemo } from "react";
import { Input } from "@/shared/components/input";
import { Select, type SelectOption } from "@/shared/components/select";
import { useCredentialOptions } from "@/features/credentials/hooks/use-credential-options";
import { normalizeProvider, getProviderDefaults } from "../lib/model-utils";

export function InspectorChatModelConfig({
  config,
  onPatch,
}: {
  config: Record<string, unknown>;
  onPatch: (patch: Record<string, unknown>) => void;
}) {
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

  const { options, loading, error } = useCredentialOptions(provider, true);
  const credentialOptions = useMemo<SelectOption[]>(
    () =>
      options.map((opt) => ({
        value: opt.id,
        label: opt.label,
        description: opt.accountEmail ? `${opt.provider} • ${opt.accountEmail}` : opt.provider,
      })),
    [options]
  );

  const invalid = !model.trim() || (!credentialId.trim() && !apiKey.trim());

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <label className="block text-xs font-bold text-muted">Provider</label>
        <Select
          value={provider}
          options={providerOptions}
          onChange={(next) => {
            const nextProvider = normalizeProvider(next);
            const nextDefaults = getProviderDefaults(nextProvider);
            onPatch({
              provider: nextProvider,
              credentialId: "",
              apiKey: "",
              model: nextDefaults.model,
              baseUrl: nextDefaults.baseUrl,
            });
          }}
          placeholder="Select provider..."
          searchable
          searchPlaceholder="Search providers..."
        />
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-bold text-muted">Credential (optional)</label>
        <Select
          value={credentialId}
          options={credentialOptions}
          onChange={(v) => onPatch({ credentialId: v })}
          placeholder="Select credential..."
          searchable
          searchPlaceholder="Search credentials..."
        />
        {loading ? <div className="text-xs text-muted">Loading credentials...</div> : null}
        {!loading && credentialOptions.length === 0 ? (
          <div className="text-xs text-muted">No credentials connected yet.</div>
        ) : null}
        {error ? <div className="text-xs text-red">{error}</div> : null}
        <div className="text-xs text-muted">Optional: use a credential from Credentials (API key).</div>
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-bold text-muted">API key (optional)</label>
        <Input
          value={apiKey}
          onChange={(e) => onPatch({ apiKey: e.target.value })}
          placeholder={provider === "gemini" ? "AIza..." : provider === "grok" ? "xai-..." : "sk-..."}
          className="h-10 rounded-lg bg-surface2 font-mono"
        />
        <div className="text-xs text-muted">If set, overrides the credential API key.</div>
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-bold text-muted">
          Model <span className="text-red"> *</span>
        </label>
        <Input
          value={model}
          onChange={(e) => onPatch({ model: e.target.value })}
          placeholder={defaults.model}
          className="h-10 rounded-lg bg-surface2 font-mono"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-bold text-muted">Base URL (optional)</label>
        <Input
          value={baseUrl}
          onChange={(e) => onPatch({ baseUrl: e.target.value })}
          placeholder={defaults.baseUrl}
          className="h-10 rounded-lg bg-surface2 font-mono"
        />
      </div>

      {invalid ? (
        <div className="text-xs text-red">
          Missing configuration: set a Model and either a Credential or API key.
        </div>
      ) : null}
    </div>
  );
}
