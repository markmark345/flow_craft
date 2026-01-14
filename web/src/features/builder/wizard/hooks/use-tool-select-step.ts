import { useMemo, useState } from "react";
import { AGENT_TOOL_CATALOG } from "@/features/builder/nodeCatalog/catalog";

export interface UseToolSelectStepReturn {
  query: string;
  setQuery: (value: string) => void;
  tools: typeof AGENT_TOOL_CATALOG;
}

/**
 * Custom hook for managing tool search and filtering.
 * Handles search query state and filters agent tool catalog.
 */
export function useToolSelectStep(): UseToolSelectStepReturn {
  const [query, setQuery] = useState("");

  const tools = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return AGENT_TOOL_CATALOG;
    return AGENT_TOOL_CATALOG.filter((t) => `${t.label} ${t.toolKey}`.toLowerCase().includes(q));
  }, [query]);

  return {
    query,
    setQuery,
    tools,
  };
}
