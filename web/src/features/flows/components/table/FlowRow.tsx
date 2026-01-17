"use client";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Icon } from "@/components/ui/icon";
import { IconButton } from "@/components/ui/icon-button";
import { cn } from "@/lib/cn";
import { FlowDTO } from "@/types/dto";
import { RunMeta, avatarStyle, formatUpdatedAt, initialsFor, ownerForFlow, statusTone } from "../../lib/flow-utils";
import { FlowRowMenu } from "./FlowRowMenu";

type Props = {
  flow: FlowDTO;
  isSelected: boolean;
  toggleSelectFlow: (id: string, next?: boolean) => void;
  onRowOpen: (id: string) => void;
  onRunFlow: (id: string) => void;
  running: boolean;
  runningFlowId: string | null;
  meta: RunMeta | null;
  menuOpenFor: string | null;
  setMenuOpenFor: (id: string | null | ((cur: string | null) => string | null)) => void;
  duplicateExistingFlow: (flow: FlowDTO) => Promise<FlowDTO>;
  duplicatingId: string | null;
  archivingId: string | null;
  deletingId: string | null;
  onArchive: (flow: FlowDTO) => void;
  onDelete: (flow: FlowDTO) => void;
  onCopied: () => void;
  onCopyFailed: () => void;
};

export function FlowRow({
  flow,
  isSelected,
  toggleSelectFlow,
  onRowOpen,
  onRunFlow,
  running,
  runningFlowId,
  meta,
  menuOpenFor,
  setMenuOpenFor,
  duplicateExistingFlow,
  duplicatingId,
  archivingId,
  deletingId,
  onArchive,
  onDelete,
  onCopied,
  onCopyFailed,
}: Props) {
  const ownerName = ownerForFlow(flow);

  return (
    <div
      className="group grid grid-cols-12 gap-4 px-6 py-3 pr-36 border-b border-border last:border-0 items-center hover:bg-surface2 transition-colors cursor-pointer relative"
      onClick={() => onRowOpen(flow.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") onRowOpen(flow.id);
      }}
    >
      <div className="col-span-4 flex items-center gap-3 min-w-0">
        <Checkbox
          checked={isSelected}
          onCheckedChange={(next) => toggleSelectFlow(flow.id, next)}
          aria-label={`Select ${flow.name}`}
          stopPropagation
          className={cn(
            "transition-opacity",
            isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          )}
        />
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-semibold text-text truncate group-hover:text-accent transition-colors">
            {flow.name}
          </span>
          <span className="text-xs text-muted font-mono mt-0.5 truncate">
            id: {flow.id.slice(0, 10)}…
          </span>
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
        <IconButton
          icon="play_arrow"
          className="p-1.5 hover:bg-surface2 rounded text-muted hover:text-accent transition-colors disabled:opacity-60 h-[30px] w-[30px]"
          title="Run now"
          disabled={running || (runningFlowId ? runningFlowId !== flow.id : false)}
          onClick={() => void onRunFlow(flow.id)}
        />
        <IconButton
          icon="edit"
          className="p-1.5 hover:bg-surface2 rounded text-muted hover:text-text transition-colors h-[30px] w-[30px]"
          title="Edit"
          onClick={() => onRowOpen(flow.id)}
        />
        <IconButton
          icon="more_horiz"
          className="p-1.5 hover:bg-surface2 rounded text-muted hover:text-text transition-colors h-[30px] w-[30px]"
          title="More"
          onClick={() => setMenuOpenFor((cur) => (cur === flow.id ? null : flow.id))}
        />

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
}
