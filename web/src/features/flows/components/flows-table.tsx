"use client";

import { FlowDTO } from "@/types/dto";
import { useFlowsTable } from "../hooks/use-flows-table";
import { TableHeader } from "./table/TableHeader";
import { FlowRow } from "./table/FlowRow";
import { RunMeta } from "../lib/flow-utils";

type Props = {
  flowsLoading: boolean;
  filteredCount: number;
  pageItems: FlowDTO[];
  allSelectedOnPage: boolean;
  selectedIds: Set<string>;
  toggleSelectAllOnPage: () => void;
  toggleSelectFlow: (id: string, next?: boolean) => void;
  onRowOpen: (id: string) => void;
  onRunFlow: (id: string) => void;
  running: boolean;
  runningFlowId: string | null;
  runMetaForFlow: (id: string) => RunMeta | null;
  duplicateExistingFlow: (flow: FlowDTO) => Promise<FlowDTO>;
  duplicatingId: string | null;
  archivingId: string | null;
  deletingId: string | null;
  onArchive: (flow: FlowDTO) => void;
  onDelete: (flow: FlowDTO) => void;
  onCopied: () => void;
  onCopyFailed: () => void;
  emptyStateMessage: string;
};

export function FlowsTable({
  flowsLoading,
  filteredCount,
  pageItems,
  allSelectedOnPage,
  selectedIds,
  toggleSelectAllOnPage,
  toggleSelectFlow,
  onRowOpen,
  onRunFlow,
  running,
  runningFlowId,
  runMetaForFlow,
  duplicateExistingFlow,
  duplicatingId,
  archivingId,
  deletingId,
  onArchive,
  onDelete,
  onCopied,
  onCopyFailed,
  emptyStateMessage,
}: Props) {
  const { menuOpenFor, setMenuOpenFor } = useFlowsTable();

  return (
    <div className="bg-panel border border-border rounded-xl shadow-soft">
      <TableHeader
        allSelectedOnPage={allSelectedOnPage}
        toggleSelectAllOnPage={toggleSelectAllOnPage}
        disabled={pageItems.length === 0}
      />

      {flowsLoading && filteredCount === 0 ? (
        <div className="px-6 py-6 text-sm text-muted">Loading…</div>
      ) : pageItems.length ? (
        <div>
          {pageItems.map((flow) => (
            <FlowRow
              key={flow.id}
              flow={flow}
              isSelected={selectedIds.has(flow.id)}
              toggleSelectFlow={toggleSelectFlow}
              onRowOpen={onRowOpen}
              onRunFlow={onRunFlow}
              running={running}
              runningFlowId={runningFlowId}
              meta={runMetaForFlow(flow.id)}
              menuOpenFor={menuOpenFor}
              setMenuOpenFor={setMenuOpenFor}
              duplicateExistingFlow={duplicateExistingFlow}
              duplicatingId={duplicatingId}
              archivingId={archivingId}
              deletingId={deletingId}
              onArchive={onArchive}
              onDelete={onDelete}
              onCopied={onCopied}
              onCopyFailed={onCopyFailed}
            />
          ))}
        </div>
      ) : (
        <div className="px-6 py-8 text-sm text-muted">{emptyStateMessage}</div>
      )}
    </div>
  );
}
