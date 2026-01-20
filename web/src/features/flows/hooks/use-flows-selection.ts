
import { useState } from "react";
import { FlowDTO } from "@/types/dto";

export function useFlowsSelection(pageItems: FlowDTO[]) {
  const [selectedIds, setSelectedIds] = useState(() => new Set<string>());

  const allSelectedOnPage = pageItems.length > 0 && pageItems.every((flow) => selectedIds.has(flow.id));

  const toggleSelectFlow = (flowId: string, next?: boolean) => {
    setSelectedIds((prev) => {
      const copy = new Set(prev);
      const shouldSelect = next ?? !copy.has(flowId);
      if (shouldSelect) copy.add(flowId);
      else copy.delete(flowId);
      return copy;
    });
  };

  const toggleSelectAllOnPage = () => {
    setSelectedIds((prev) => {
      const copy = new Set(prev);
      const shouldSelectAll = !allSelectedOnPage;
      for (const flow of pageItems) {
        if (shouldSelectAll) copy.add(flow.id);
        else copy.delete(flow.id);
      }
      return copy;
    });
  };

  return {
    selectedIds,
    setSelectedIds,
    allSelectedOnPage,
    toggleSelectFlow,
    toggleSelectAllOnPage,
  };
}
