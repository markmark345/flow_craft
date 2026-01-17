"use client";

import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";

type Props = {
  item: any;
  isAdmin: boolean;
  onEdit: (item: any) => void;
  onDelete: (id: string) => void;
  formatDate: (val?: string) => string;
};

export function VariableItem({ item, isAdmin, onEdit, onDelete, formatDate }: Props) {
  return (
    <div key={item.id} className="py-4 flex flex-wrap items-center justify-between gap-4">
      <div className="min-w-0">
        <div className="text-sm font-semibold text-text">{item.key}</div>
        <div className="text-xs text-muted truncate max-w-[520px]">{item.value || "—"}</div>
        <div className="text-[11px] text-muted mt-1">
          Updated {formatDate(item.updatedAt)} · Created {formatDate(item.createdAt)}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          className="h-9 px-3 rounded-lg border border-border bg-surface2 text-xs font-semibold text-text hover:bg-surface transition-colors"
          onClick={() => onEdit(item)}
          disabled={!isAdmin}
        >
          Edit
        </Button>
        <IconButton
          icon="delete"
          className="h-9 w-9 rounded-lg border border-border bg-surface2 text-red hover:bg-surface transition-colors"
          onClick={() => onDelete(item.id)}
          disabled={!isAdmin}
          aria-label="Delete variable"
        />
      </div>
    </div>
  );
}
