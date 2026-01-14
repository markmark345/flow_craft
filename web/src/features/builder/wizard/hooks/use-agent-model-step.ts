import { useEffect, useMemo } from "react";
import type { SelectOption } from "@/shared/components/select";
import { MODEL_PROVIDERS } from "@/features/builder/nodeCatalog/catalog";

export interface UseAgentModelStepReturn {
  provider: string;
  providerMeta: typeof MODEL_PROVIDERS[number];
  credentialProvider: string | undefined;
  credentialOptions: SelectOption[];
  model: string;
  baseUrl: string;
  credentialId: string;
  apiKeyOverride: string;
  patchModel: (patch: Record<string, unknown>) => void;
}

/**
 * Custom hook for managing agent model configuration step.
 * Handles provider selection, credential options, and model defaults.
 */
export function useAgentModelStep(
  draft: any,
  setDraft: (patch: any) => void,
  credentialOptionsData: { options: any[] }
): UseAgentModelStepReturn {
  useEffect(() => {
    if (draft.model) return;
    const openai = MODEL_PROVIDERS.find((p) => p.key === "openai")!;
    setDraft({
      model: {
        provider: openai.key,
        model: openai.defaultModel,
        baseUrl: openai.defaultBaseUrl,
        credentialId: "",
        apiKeyOverride: "",
      } as any,
    });
  }, [draft.model, setDraft]);

  const provider = (draft.model?.provider || "openai") as any;
  const providerMeta = MODEL_PROVIDERS.find((p) => p.key === provider) || MODEL_PROVIDERS[0];

  const credentialProvider = provider === "custom" ? undefined : provider;

  const credentialOptions = useMemo<SelectOption[]>(
    () =>
      credentialOptionsData.options.map((opt) => ({
        value: opt.id,
        label: opt.label,
        description: opt.accountEmail ? `${opt.provider} • ${opt.accountEmail}` : opt.provider,
      })),
    [credentialOptionsData.options]
  );

  const model = draft.model?.model || "";
  const baseUrl = draft.model?.baseUrl || "";
  const credentialId = draft.model?.credentialId || "";
  const apiKeyOverride = draft.model?.apiKeyOverride || "";

  const patchModel = (patch: Record<string, unknown>) => {
    const next = { ...(draft.model || {}), ...patch } as any;
    setDraft({ model: next });
  };

  return {
    provider,
    providerMeta,
    credentialProvider,
    credentialOptions,
    model,
    baseUrl,
    credentialId,
    apiKeyOverride,
    patchModel,
  };
}
