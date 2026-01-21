
import { useMemo, useState } from "react";
import { CredentialDTO } from "@/types/dto";

export type SortKey = "updated" | "created" | "name";

export function useCredentialsFilters(items: CredentialDTO[]) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("updated");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? items.filter((item) => {
          const hay = `${item.name} ${item.provider} ${item.accountEmail || ""}`.toLowerCase();
          return hay.includes(q);
        })
      : items;
    const sorted = [...list];
    sorted.sort((a, b) => {
      if (sortKey === "name") return (a.name || "").localeCompare(b.name || "");
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
