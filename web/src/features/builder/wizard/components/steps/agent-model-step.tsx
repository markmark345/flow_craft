"use client";

import { Input } from "@/components/ui/input";
import { Select, type SelectOption } from "@/components/ui/select";
import { useCredentialOptions } from "@/features/credentials/hooks/use-credential-options";
import { NodeIcon } from "@/features/builder/components/node/node-icon";
import { MODEL_PROVIDERS } from "@/features/builder/nodeCatalog/catalog";
import { useWizardStore, type AgentDraft } from "../../store/use-wizard-store";
import { useAgentModelStep } from "../../hooks/use-agent-model-step";

const providerOptions: SelectOption[] = MODEL_PROVIDERS.map((p) => ({
  value: p.key,
  label: p.label,
  description: p.key === "custom" ? "OpenAI-compatible endpoint" : undefined,
}));

export function AgentModelStep() {
  const draft = useWizardStore((s) => s.draft) as AgentDraft;
  const setDraft = useWizardStore((s) => s.setDraft);
  const errors = useWizardStore((s) => s.validationErrors);

  const {
    provider,
    providerMeta,
    credentialProvider,
    model,
    baseUrl,
    credentialId,
    apiKeyOverride,
    patchModel,
  } = useAgentModelStep(draft, setDraft);

  const { options: credOptionsRaw, loading, error } = useCredentialOptions(credentialProvider, provider !== "custom");
  const credentialOptions: SelectOption[] = credOptionsRaw.map((opt) => ({
    value: opt.id,
    label: opt.label,
    description: opt.accountEmail ? `${opt.provider} • ${opt.accountEmail}` : opt.provider,
  }));

  return (
    <div className="space-y-5">
      <div>
        <div className="text-sm font-semibold text-text">Model</div>
        <div className="text-xs text-muted">Choose a model provider and configure credentials.</div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-xs font-bold text-muted">
            Provider <span className="text-red"> *</span>
          </label>
          <div className="flex items-center gap-2">
            <div
              className="w-10 h-10 rounded-lg border flex items-center justify-center shrink-0"
              style={{
                background: "color-mix(in srgb, var(--accent) var(--accent-tint, 10%), transparent)",
                borderColor: "color-mix(in srgb, var(--accent) 18%, transparent)",
                color: "var(--accent)",
              }}
            >
              <NodeIcon nodeType={(provider === "custom" ? "chatModel" : provider) as any} className="h-5 w-5" />
            </div>
            <Select
              value={provider}
              options={providerOptions}
              onChange={(next) => {
                const meta = MODEL_PROVIDERS.find((p) => p.key === next) || MODEL_PROVIDERS[0];
                patchModel({
                  provider: meta.key,
                  model: meta.defaultModel,
                  baseUrl: meta.defaultBaseUrl,
                  credentialId: "",
                  apiKeyOverride: "",
                });
              }}
              placeholder="Select provider..."
              searchable
              searchPlaceholder="Search providers..."
              className="flex-1"
            />
          </div>
          {errors.provider ? <div className="text-xs text-red">{errors.provider}</div> : null}
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold text-muted">Credential (optional)</label>
          <Select
            value={credentialId}
            options={credentialOptions}
            onChange={(v) => patchModel({ credentialId: v })}
            placeholder={provider === "custom" ? "Not available" : "Select credential..."}
            searchable
            searchPlaceholder="Search credentials..."
            className={provider === "custom" ? "opacity-60 pointer-events-none" : ""}
          />
          {loading ? <div className="text-xs text-muted">Loading credentials...</div> : null}
          {!loading && provider !== "custom" && credentialOptions.length === 0 ? (
            <div className="text-xs text-muted">No credentials connected yet.</div>
          ) : null}
          {error ? <div className="text-xs text-red">{error}</div> : null}
          {errors.credentialId ? <div className="text-xs text-red">{errors.credentialId}</div> : null}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-xs font-bold text-muted">API key (optional)</label>
          <Input
            value={apiKeyOverride}
            onChange={(e) => patchModel({ apiKeyOverride: e.target.value })}
            placeholder={provider === "gemini" ? "AIza..." : provider === "grok" ? "xai-..." : "sk-..."}
            className="h-10 rounded-lg bg-surface2 font-mono"
          />
          <div className="text-xs text-muted">If set, overrides the credential API key.</div>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold text-muted">
            Model name <span className="text-red"> *</span>
          </label>
          <Input
            value={model}
            onChange={(e) => patchModel({ model: e.target.value })}
            placeholder={providerMeta.defaultModel}
            className="h-10 rounded-lg bg-surface2 font-mono"
          />
          {errors.modelName ? <div className="text-xs text-red">{errors.modelName}</div> : null}
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-bold text-muted">Base URL (optional)</label>
        <Input
          value={baseUrl}
          onChange={(e) => patchModel({ baseUrl: e.target.value })}
          placeholder={providerMeta.defaultBaseUrl}
          className="h-10 rounded-lg bg-surface2 font-mono"
        />
      </div>

      {errors.model ? <div className="text-xs text-red">{errors.model}</div> : null}
    </div>
  );
}
