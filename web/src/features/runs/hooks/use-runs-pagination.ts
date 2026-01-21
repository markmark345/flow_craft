
import { useEffect, useState } from "react";
import { RunDTO } from "@/types/dto";

export function useRunsPagination(filteredItems: RunDTO[]) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Pagination logic
  const pageCount = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const pageSafe = Math.min(page, pageCount);
  const pageStartIdx = (pageSafe - 1) * pageSize;
  const pageItems = filteredItems.slice(pageStartIdx, pageStartIdx + pageSize);

  // Reset page when filters change (items change)
  // Note: Consumer needs to trigger resetPage or we watch filteredItems.length here?
  // Ideally, if the filtered list changes drastically, we reset.
  // But strictly, often we want to reset only on filter criteria change, which this hook might not know about directly.
  // However, watching filteredItems is a decent proxy, though it might reset on simple data updates.
  // A safer approach is to expose `resetPage` or let the consumer handle the side-effect.
  // Looking at original code: `useEffect(() => setPage(1), [query, status, timeframe, flowId, pageSize]);`
  // so it resets on criteria change.
  
  const resetPage = () => setPage(1);

  return {
    page,
    setPage,
    pageSize,
    setPageSize,
    pageCount,
    pageSafe,
    pageStartIdx,
    pageItems,
    resetPage,
  };
}
