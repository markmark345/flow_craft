"use client";

import { Icon } from "@/components/ui/icon";
import { IconButton } from "@/components/ui/icon-button";
import { cn } from "@/lib/cn";
import { StickyNote } from "@/features/builder/types";
import { formatRelative, initialsFor } from "@/features/builder/lib/sticky-note-utils";

type Props = {
  note: StickyNote;
  innerBorder: string;
  accent: string;
  metaColor: string;
  fg: string;
  onStartResize: (e: React.PointerEvent) => void;
};

export function NoteFooter({
  note,
  innerBorder,
  accent,
  metaColor,
  fg,
  onStartResize,
}: Props) {
  const by = note.updatedBy || note.createdBy;
  const when = note.updatedAt || note.createdAt;

  return (
    <div
      className="px-4 py-3 flex items-center justify-between border-t select-none"
      style={{ borderColor: innerBorder }}
    >
      <div className="flex items-center gap-2 min-w-0">
        <div
          className="h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold"
          style={{
            background: `color-mix(in srgb, ${accent} 18%, transparent)`,
            color: `color-mix(in srgb, ${accent} 80%, ${fg})`,
          }}
          title={by?.email || "Unknown user"}
        >
          {initialsFor(by)}
        </div>
        <div className="min-w-0">
          {by?.name ? (
            <div className="text-xs font-medium truncate" style={{ color: metaColor }}>
              {by.name} · {formatRelative(when)}
            </div>
          ) : (
            <div className="text-xs font-medium" style={{ color: metaColor }}>
              {formatRelative(when)}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <Icon name="edit" className="text-[16px]" style={{ color: metaColor }} />
        <IconButton
          icon={
            <svg width="14" height="14" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 9L9 6M3 9L9 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          }
          className={cn(
            "h-6 w-6 rounded-md cursor-nwse-resize",
            "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity",
            "text-muted hover:text-text hover:bg-surface2"
          )}
          title="Resize"
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onStartResize(e);
          }}
        />
      </div>
    </div>
  );
}
