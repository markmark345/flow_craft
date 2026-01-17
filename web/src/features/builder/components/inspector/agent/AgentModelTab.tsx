"use client";

import { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, type SelectOption } from "@/components/ui/select";
import { NodeIcon } from "../../node/node-icon";
import { MODEL_PROVIDERS } from "../../../nodeCatalog/catalog";
import { useCredentialOptions } from "@/features/credentials/hooks/use-credential-options";
import { isValidAgentModelConfig, type AgentModelConfig } from "../../../types/agent";

type Props = {
  model: AgentModelConfig | null;
  onPatchModel: (patch: Partial<AgentModelConfig>) => void;
};

export function AgentModelTab({ model, onPatchModel }: Props) {
  const provider = model?.provider || "openai";
  const providerMeta = MODEL_PROVIDERS.find((p) => p.key === provider) || MODEL_PROVIDERS[0];

  const providerOptions = useMemo<SelectOption[]>(
    () => MODEL_PROVIDERS.map((p) => ({ value: p.key, label: p.label })),
    []
  );

  const credentialProvider = provider === "custom" ? undefined : provider;
  const { options: credentialItems, loading: credLoading, error: credError } = useCredentialOptions(
    credentialProvider,
    provider !== "custom"
  );
  const credentialOptions = useMemo<SelectOption[]>(
    () =>
      credentialItems.map((opt) => ({
        value: opt.id,
        label: opt.label,
        description: opt.accountEmail ? `${opt.provider} • ${opt.accountEmail}` : opt.provider,
      })),
    [credentialItems]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-lg border flex items-center justify-center shrink-0"
          style={{
            background: "color-mix(in srgb, var(--accent) var(--accent-tint, 10%), transparent)",
            borderColor: "color-mix(in srgb, var(--accent) 18%, transparent)",
            color: "var(--accent)",
          }}
        >
          <NodeIcon nodeType={(provider === "custom" ? "chatModel" : (provider as any)) as any} className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-bold text-text">Chat Model</div>
          <div className="text-xs text-muted">Configure the model connection for this agent.</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label className="text-xs font-bold text-muted">Provider</Label>
          <Select
            value={provider}
            options={providerOptions}
            onChange={(v) => {
              const meta = MODEL_PROVIDERS.find((p) => p.key === v) || MODEL_PROVIDERS[0];
              onPatchModel({
                provider: meta.key as any,
                model: meta.defaultModel,
                baseUrl: meta.defaultBaseUrl,
                credentialId: "",
                apiKeyOverride: "",
              });
            }}
            searchable
            searchPlaceholder="Search providers..."
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-bold text-muted">Credential (optional)</Label>
          <Select
            value={model?.credentialId || ""}
            options={credentialOptions}
            onChange={(v) => onPatchModel({ credentialId: v })}
            placeholder={provider === "custom" ? "Not available" : "Select credential..."}
            searchable
            searchPlaceholder="Search credentials..."
            className={provider === "custom" ? "opacity-60 pointer-events-none" : ""}
          />
          {credLoading ? <div className="text-xs text-muted">Loading credentials...</div> : null}
          {credError ? <div className="text-xs text-red">{credError}</div> : null}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label className="text-xs font-bold text-muted">API key override (optional)</Label>
          <Input
            value={model?.apiKeyOverride || ""}
            onChange={(e) => onPatchModel({ apiKeyOverride: e.target.value })}
            placeholder={provider === "gemini" ? "AIza..." : provider === "grok" ? "xai-..." : "sk-..."}
            className="h-10 rounded-lg bg-surface2 font-mono"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-bold text-muted">
            Model <span className="text-red"> *</span>
          </Label>
          <Input
            value={model?.model || ""}
            onChange={(e) => onPatchModel({ model: e.target.value })}
            placeholder={providerMeta.defaultModel}
            className="h-10 rounded-lg bg-surface2 font-mono"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-bold text-muted">Base URL (optional)</Label>
        <Input
          value={model?.baseUrl || ""}
          onChange={(e) => onPatchModel({ baseUrl: e.target.value })}
          placeholder={providerMeta.defaultBaseUrl}
          className="h-10 rounded-lg bg-surface2 font-mono"
        />
      </div>

      {!isValidAgentModelConfig(model) ? (
        <div className="text-xs text-red">Missing configuration: set a Model and either a Credential or API key.</div>
      ) : null}
    </div>
  );
}
