import { useMemo, useState } from "react";
import { APP_CATALOG } from "@/features/builder/nodeCatalog/catalog";

export interface UseAppSelectStepReturn {
  query: string;
  setQuery: (value: string) => void;
  apps: typeof APP_CATALOG[keyof typeof APP_CATALOG][];
}

/**
 * Custom hook for managing app search and filtering.
 * Handles search query state and filters app catalog.
 */
export function useAppSelectStep(): UseAppSelectStepReturn {
  const [query, setQuery] = useState("");

  const apps = useMemo(() => {
    const all = Object.values(APP_CATALOG);
    const q = query.trim().toLowerCase();
    if (!q) return all;
    return all.filter((app) => `${app.label} ${app.description} ${app.appKey}`.toLowerCase().includes(q));
  }, [query]);

  return {
    query,
    setQuery,
    apps,
  };
}
