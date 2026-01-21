
import { useState, useEffect } from "react";
import { FlowDTO } from "@/types/dto";

export function useFlowsPagination(filteredFlows: FlowDTO[]) {
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  // Pagination calculations
  const pageCount = Math.max(1, Math.ceil(filteredFlows.length / pageSize));
  const pageSafe = Math.min(page, pageCount);
  const pageStartIdx = (pageSafe - 1) * pageSize;
  const pageItems = filteredFlows.slice(pageStartIdx, pageStartIdx + pageSize);

  // Adjust page if out of range
  useEffect(() => {
    if (page !== pageSafe) setPage(pageSafe);
  }, [page, pageSafe]);

  // Reset page when multiple filters likely changed the count significantly
  // This is usually handled by the consumer resetting page, but here we can expose the setter
  // and let the filter hook or the main hook coordinate resetting.
  
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
