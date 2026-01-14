import { useMemo, useState } from "react";
import { AGENT_TOOL_CATALOG } from "@/features/builder/nodeCatalog/catalog";

export interface UseAgentToolsStepReturn {
  query: string;
  setQuery: (value: string) => void;
  available: typeof AGENT_TOOL_CATALOG;
  addTool: (toolKey: string) => void;
  removeTool: (id: string) => void;
}

/**
 * Custom hook for managing agent tools selection and search.
 * Handles tool search, adding/removing tools from draft.
 */
export function useAgentToolsStep(
  tools: any[],
  setDraft: (patch: any) => void
): UseAgentToolsStepReturn {
  const [query, setQuery] = useState("");

  const available = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return AGENT_TOOL_CATALOG;
    return AGENT_TOOL_CATALOG.filter((t) => `${t.label} ${t.toolKey}`.toLowerCase().includes(q));
  }, [query]);

  const addTool = (toolKey: string) => {
    const next = [
      ...tools,
      {
        id: crypto.randomUUID(),
        toolKey,
        enabled: true,
        credentialId: "",
        config: {},
      },
    ];
    setDraft({ tools: next });
  };

  const removeTool = (id: string) => {
    setDraft({ tools: tools.filter((t) => t.id !== id) });
  };

  return {
    query,
    setQuery,
    available,
    addTool,
    removeTool,
  };
}
