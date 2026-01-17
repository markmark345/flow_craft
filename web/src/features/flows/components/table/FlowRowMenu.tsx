"use client";

import { Button } from "@/components/ui/button";
import { FlowDTO } from "@/types/dto";

type Props = {
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
};

export function FlowRowMenu({
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
}: Props) {
  return (
    <div className="absolute right-0 top-full mt-1 w-44 rounded-lg border border-border bg-panel shadow-lift overflow-hidden">
      <Button
        variant="ghost"
        className="w-full justify-start px-3 py-2 h-auto text-sm hover:bg-surface2 font-normal rounded-none"
        onClick={async (e) => {
          e.stopPropagation();
          onClose();
          try {
            const created = await duplicateExistingFlow(flow);
            onOpen(created.id);
          } catch {}
        }}
        disabled={duplicating}
      >
        {duplicating ? "Duplicating…" : "Duplicate"}
      </Button>

      <Button
        variant="ghost"
        className="w-full justify-start px-3 py-2 h-auto text-sm hover:bg-surface2 font-normal rounded-none"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
          onArchive();
        }}
        disabled={archiving || flow.status === "archived"}
      >
        {flow.status === "archived" ? "Archived" : archiving ? "Archiving…" : "Archive"}
      </Button>

      <Button
        variant="ghost"
        className="w-full justify-start px-3 py-2 h-auto text-sm hover:bg-surface2 font-normal rounded-none"
        onClick={async (e) => {
          e.stopPropagation();
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
      </Button>

      <Button
        variant="ghost"
        className="w-full justify-start px-3 py-2 h-auto text-sm text-red hover:bg-surface2 hover:text-red font-normal rounded-none"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
          onDelete();
        }}
        disabled={deleting}
      >
        {deleting ? "Deleting…" : "Delete"}
      </Button>
    </div>
  );
}
