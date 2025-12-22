"use client";

import { useEffect, useState } from "react";

import { Badge } from "@/shared/components/badge";
import { Icon } from "@/shared/components/icon";
import { cn } from "@/shared/lib/cn";
import { FlowDTO } from "@/shared/types/dto";
import { RunMeta, avatarStyle, formatUpdatedAt, initialsFor, ownerForFlow, statusTone } from "./flows-page-utils";

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
}: {
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
}) {
  const [menuOpenFor, setMenuOpenFor] = useState<string | null>(null);

  useEffect(() => {
    if (!menuOpenFor) return;
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      const el = document.querySelector(`[data-flow-menu-root="${menuOpenFor}"]`);
      if (!el || !el.contains(target)) setMenuOpenFor(null);
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [menuOpenFor]);

  return (
    <div className="bg-panel border border-border rounded-xl shadow-soft">
      <div className="grid grid-cols-12 gap-4 px-6 py-3 pr-36 bg-surface2 border-b border-border items-center text-xs font-semibold text-muted uppercase tracking-wider">
        <div className="col-span-4 flex items-center gap-3">
          <input
            type="checkbox"
            className="size-4 rounded border-border text-accent focus:shadow-focus"
            checked={allSelectedOnPage}
            onChange={toggleSelectAllOnPage}
            disabled={pageItems.length === 0}
            aria-label="Select all flows on page"
            onClick={(e) => e.stopPropagation()}
          />
          <span>Name</span>
        </div>
        <div className="col-span-2">Status</div>
        <div className="col-span-2">Last run</div>
        <div className="col-span-2">Owner</div>
        <div className="col-span-2 text-right">Updated</div>
      </div>

      {flowsLoading && filteredCount === 0 ? (
        <div className="px-6 py-6 text-sm text-muted">Loading…</div>
      ) : pageItems.length ? (
        <div>
          {pageItems.map((flow) => {
            const meta = runMetaForFlow(flow.id);
            const ownerName = ownerForFlow(flow);
            const isSelected = selectedIds.has(flow.id);
            return (
              <div
                key={flow.id}
                className="group grid grid-cols-12 gap-4 px-6 py-3 pr-36 border-b border-border last:border-0 items-center hover:bg-surface2 transition-colors cursor-pointer relative"
                onClick={() => onRowOpen(flow.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onRowOpen(flow.id);
                }}
              >
                <div className="col-span-4 flex items-center gap-3 min-w-0">
                  <input
                    type="checkbox"
                    className={cn(
                      "size-4 rounded border-border text-accent focus:shadow-focus transition-opacity",
                      isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    )}
                    checked={isSelected}
                    onChange={(e) => toggleSelectFlow(flow.id, e.target.checked)}
                    aria-label={`Select ${flow.name}`}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold text-text truncate group-hover:text-accent transition-colors">
                      {flow.name}
                    </span>
                    <span className="text-xs text-muted font-mono mt-0.5 truncate">id: {flow.id.slice(0, 10)}…</span>
                  </div>
                </div>

                <div className="col-span-2">
                  <Badge label={flow.status} tone={statusTone(flow.status)} />
                </div>

                <div className="col-span-2 flex flex-col min-w-0">
                  <span className="text-sm text-text">{meta?.when || "Never"}</span>
                  {meta ? (
                    <span className={cn("text-xs flex items-center gap-1 truncate", meta.className)}>
                      <Icon name={meta.icon} className="text-[14px]" />
                      <span className="truncate">{meta.label}</span>
                    </span>
                  ) : (
                    <span className="text-xs text-muted">—</span>
                  )}
                </div>

                <div className="col-span-2 flex items-center gap-2 min-w-0">
                  <div
                    className="size-6 rounded-full flex items-center justify-center text-[10px] font-bold border border-border shrink-0"
                    style={avatarStyle(ownerName)}
                  >
                    {initialsFor(ownerName)}
                  </div>
                  <span className="text-sm text-text truncate">{ownerName}</span>
                </div>

                <div className="col-span-2 text-right text-sm text-muted font-mono">
                  {formatUpdatedAt(flow.updatedAt)}
                </div>

                <div
                  className={cn(
                    "absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-panel shadow-soft border border-border rounded-lg p-1 transition-all z-10",
                    menuOpenFor === flow.id
                      ? "opacity-100"
                      : "opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto"
                  )}
                  data-flow-menu-root={flow.id}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    className="p-1.5 hover:bg-surface2 rounded text-muted hover:text-accent transition-colors disabled:opacity-60"
                    title="Run now"
                    disabled={running || (runningFlowId ? runningFlowId !== flow.id : false)}
                    onClick={() => void onRunFlow(flow.id)}
                  >
                    <Icon name="play_arrow" className="text-[18px]" />
                  </button>
                  <button
                    type="button"
                    className="p-1.5 hover:bg-surface2 rounded text-muted hover:text-text transition-colors"
                    title="Edit"
                    onClick={() => onRowOpen(flow.id)}
                  >
                    <Icon name="edit" className="text-[18px]" />
                  </button>
                  <button
                    type="button"
                    className="p-1.5 hover:bg-surface2 rounded text-muted hover:text-text transition-colors"
                    title="More"
                    onClick={() => setMenuOpenFor((cur) => (cur === flow.id ? null : flow.id))}
                  >
                    <Icon name="more_horiz" className="text-[18px]" />
                  </button>

                  {menuOpenFor === flow.id ? (
                    <FlowRowMenu
                      flow={flow}
                      duplicateExistingFlow={duplicateExistingFlow}
                      duplicating={duplicatingId === flow.id}
                      archiving={archivingId === flow.id}
                      deleting={deletingId === flow.id}
                      onArchive={() => onArchive(flow)}
                      onDelete={() => onDelete(flow)}
                      onClose={() => setMenuOpenFor(null)}
                      onCopied={onCopied}
                      onCopyFailed={onCopyFailed}
                      onOpen={(id) => onRowOpen(id)}
                    />
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="px-6 py-8 text-sm text-muted">{emptyStateMessage}</div>
      )}
    </div>
  );
}

function FlowRowMenu({
  flow,
  duplicateExistingFlow,
  duplicating,
  archiving,
  deleting,
  onArchive,
  onDelete,
  onClose,
  onCopied,
  onCopyFailed,
  onOpen,
}: {
  flow: FlowDTO;
  duplicateExistingFlow: (flow: FlowDTO) => Promise<FlowDTO>;
  duplicating: boolean;
  archiving: boolean;
  deleting: boolean;
  onArchive: () => void;
  onDelete: () => void;
  onClose: () => void;
  onCopied: () => void;
  onCopyFailed: () => void;
  onOpen: (id: string) => void;
}) {
  return (
    <div className="absolute right-0 top-full mt-1 w-44 rounded-lg border border-border bg-panel shadow-lift overflow-hidden">
      <button
        type="button"
        className="w-full text-left px-3 py-2 text-sm hover:bg-surface2 transition-colors disabled:opacity-60"
        onClick={async () => {
          onClose();
          try {
            const created = await duplicateExistingFlow(flow);
            onOpen(created.id);
          } catch {}
        }}
        disabled={duplicating}
      >
        {duplicating ? "Duplicating…" : "Duplicate"}
      </button>

      <button
        type="button"
        className="w-full text-left px-3 py-2 text-sm hover:bg-surface2 transition-colors disabled:opacity-60"
        onClick={() => {
          onClose();
          onArchive();
        }}
        disabled={archiving || flow.status === "archived"}
      >
        {flow.status === "archived" ? "Archived" : archiving ? "Archiving…" : "Archive"}
      </button>

      <button
        type="button"
        className="w-full text-left px-3 py-2 text-sm hover:bg-surface2 transition-colors"
        onClick={async () => {
          onClose();
          try {
            await navigator.clipboard.writeText(flow.id);
            onCopied();
          } catch {
            onCopyFailed();
          }
        }}
      >
        Copy ID
      </button>

      <button
        type="button"
        className="w-full text-left px-3 py-2 text-sm text-red hover:bg-surface2 transition-colors disabled:opacity-60"
        onClick={() => {
          onClose();
          onDelete();
        }}
        disabled={deleting}
      >
        {deleting ? "Deleting…" : "Delete"}
      </button>
    </div>
  );
}
