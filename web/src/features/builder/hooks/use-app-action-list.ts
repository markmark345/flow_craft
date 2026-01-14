import { useMemo, useState } from "react";
import { APP_CATALOG, listAppActions, type AppActionListItem, type AppKey } from "../nodeCatalog/catalog";

export interface UseAppActionListReturn {
  query: string;
  setQuery: (value: string) => void;
  allItems: AppActionListItem[];
  actionCount: number;
  filteredByCategory: typeof APP_CATALOG[AppKey]["categories"];
  selectedMeta: AppActionListItem | null;
}

/**
 * Custom hook for managing app action list filtering and search.
 * Handles search query, category filtering, and selected action metadata.
 */
export function useAppActionList(
  appKey: AppKey,
  selectedActionKey?: string | null
): UseAppActionListReturn {
  const app = APP_CATALOG[appKey];
  const [query, setQuery] = useState("");

  const allItems = useMemo(() => listAppActions(appKey), [appKey]);

  const actionCount = useMemo(
    () => allItems.filter((i) => (i.kind || "action") === "action").length,
    [allItems]
  );

  const filteredByCategory = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return app.categories;
    return app.categories
      .map((cat) => ({
        ...cat,
        items: cat.items.filter((item) => {
          const text = `${item.label} ${item.description} ${item.actionKey}`.toLowerCase();
          return text.includes(q);
        }),
      }))
      .filter((cat) => cat.items.length > 0);
  }, [app.categories, query]);

  const selectedMeta = useMemo<AppActionListItem | null>(() => {
    const actionKey = String(selectedActionKey || "").trim();
    if (!actionKey) return null;
    return allItems.find((item) => item.actionKey === actionKey) || null;
  }, [allItems, selectedActionKey]);

  return {
    query,
    setQuery,
    allItems,
    actionCount,
    filteredByCategory,
    selectedMeta,
  };
}
