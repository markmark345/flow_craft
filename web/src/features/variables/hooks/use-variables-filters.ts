
import { useMemo, useState } from "react";
import { VariableDTO } from "@/types/dto";

export type SortKey = "updated" | "created" | "key";

export function useVariablesFilters(items: VariableDTO[]) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("updated");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? items.filter((item) => item.key.toLowerCase().includes(q) || item.value.toLowerCase().includes(q))
      : items;
    const sorted = [...list];
    sorted.sort((a, b) => {
      if (sortKey === "key") return a.key.localeCompare(b.key);
      const aTime = sortKey === "created" ? a.createdAt : a.updatedAt;
      const bTime = sortKey === "created" ? b.createdAt : b.updatedAt;
      return (bTime || "").localeCompare(aTime || "");
    });
    return sorted;
  }, [items, query, sortKey]);

  return {
    query,
    setQuery,
    sortKey,
    setSortKey,
    filtered,
  };
}
