"use client";

import { IconButton } from "@/components/ui/icon-button";
import { NodeIcon } from "../node-icon";

type Props = {
  label: string;
  description?: string;
  icon?: string;
  accentColor: string;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onAction?: (e: React.MouseEvent) => void;
  actionTitle?: string;
};

export function PaletteItem({
  label,
  description,
  icon,
  accentColor,
  draggable,
  onDragStart,
  onAction,
  actionTitle = "Add",
}: Props) {
  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      className="flex items-center gap-3 p-2 rounded-lg bg-surface hover:bg-surface2 cursor-grab active:cursor-grabbing border border-border hover:shadow-soft transition-all group select-none"
      style={{ borderColor: "color-mix(in srgb, var(--border) 70%, transparent)" }}
    >
      <div
        className="w-8 h-8 rounded-md flex items-center justify-center shrink-0 border"
        style={{
          color: accentColor,
          background: `color-mix(in srgb, ${accentColor} 14%, transparent)`,
          borderColor: `color-mix(in srgb, ${accentColor} 24%, transparent)`,
        }}
      >
        <NodeIcon nodeType={icon as any} className="h-5 w-5" />
      </div>
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-sm font-semibold text-text group-hover:text-text">{label}</span>
        <span className="text-[10px] text-muted truncate">
          {description}
        </span>
      </div>
      {onAction && (
        <IconButton
          icon="add"
          className="h-8 w-8 rounded-md border border-border bg-surface2 text-muted hover:text-text hover:bg-surface transition-colors"
          title={actionTitle}
          onClick={(e) => {
            e.stopPropagation();
            onAction(e);
          }}
        />
      )}
    </div>
  );
}
