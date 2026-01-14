import { useMemo } from "react";
import type { SchemaField } from "@/shared/components/SchemaForm/types";
import { APP_CATALOG, AGENT_TOOL_CATALOG } from "@/features/builder/nodeCatalog/catalog";
import type { AgentToolDraft, AppNodeDraft } from "../store/use-wizard-store";

export interface UseWizardCredentialStepReturn {
  schema: SchemaField[];
}

/**
 * Custom hook for computing credential schema based on wizard mode.
 * Returns base fields for app or agent tool authentication.
 */
export function useWizardCredentialStep(
  mode: string,
  draft: AppNodeDraft | AgentToolDraft
): UseWizardCredentialStepReturn {
  const schema = useMemo<SchemaField[]>(() => {
    if (mode === "add-agent-tool") {
      const d = draft as AgentToolDraft;
      const tool = AGENT_TOOL_CATALOG.find((t) => t.toolKey === d.toolKey);
      return tool?.baseFields || [];
    }
    const d = draft as AppNodeDraft;
    if (!d.app) return [];
    return APP_CATALOG[d.app]?.baseFields || [];
  }, [draft, mode]);

  return {
    schema,
  };
}
