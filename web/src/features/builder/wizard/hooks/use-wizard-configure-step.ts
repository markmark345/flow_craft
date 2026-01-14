import { useMemo } from "react";
import type { SchemaField } from "@/shared/components/SchemaForm/types";
import { AGENT_TOOL_CATALOG, findAppAction } from "@/features/builder/nodeCatalog/catalog";
import type { AgentToolDraft, AppNodeDraft } from "../store/use-wizard-store";

export interface UseWizardConfigureStepReturn {
  schema: SchemaField[];
}

/**
 * Custom hook for computing configuration schema based on wizard mode and draft.
 * Returns appropriate fields for app actions or agent tools.
 */
export function useWizardConfigureStep(
  mode: string,
  draft: AppNodeDraft | AgentToolDraft
): UseWizardConfigureStepReturn {
  const schema = useMemo<SchemaField[]>(() => {
    if (mode === "add-agent-tool") {
      const d = draft as AgentToolDraft;
      const tool = AGENT_TOOL_CATALOG.find((t) => t.toolKey === d.toolKey);
      return tool?.fields || [];
    }
    const d = draft as AppNodeDraft;
    if (!d.app || !d.action) return [];
    return findAppAction(d.app, d.action)?.fields || [];
  }, [draft, mode]);

  return {
    schema,
  };
}
