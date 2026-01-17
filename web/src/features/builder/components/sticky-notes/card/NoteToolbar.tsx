"use client";

import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { cn } from "@/lib/cn";
import { StickyNote } from "@/features/builder/types";
import { NOTE_COLOR_OPTIONS, NOTE_PREVIEW_BG } from "@/features/builder/lib/sticky-note-utils";

type Props = {
  note: StickyNote;
  onChangeColor: (color: StickyNote["color"]) => void;
  onDuplicate: () => void;
  onDelete: () => void;
};

export function NoteToolbar({ note, onChangeColor, onDuplicate, onDelete }: Props) {
  return (
    <div
      className={cn(
        "absolute -top-10 left-0 right-0 h-9 flex items-center justify-between px-1 z-20",
        "opacity-0 translate-y-2 transition-all duration-200",
        "group-hover:opacity-100 group-hover:translate-y-0",
        "group-focus-within:opacity-100 group-focus-within:translate-y-0",
        "pointer-events-none group-hover:pointer-events-auto group-focus-within:pointer-events-auto"
      )}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="flex items-center bg-panel border border-border rounded-md shadow-soft p-0.5">
        {NOTE_COLOR_OPTIONS.map((c) => {
          const active = c === note.color;
          return (
            <Button
              key={c}
              variant="ghost"
              className={cn("h-7 w-7 p-0 inline-flex items-center justify-center rounded-md hover:bg-surface2")}
              title={`Color: ${c}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onChangeColor(c);
              }}
            >
              <span
                className="h-3 w-3 rounded-full border border-border"
                style={{
                  background: NOTE_PREVIEW_BG[c],
                  boxShadow: active ? "0 0 0 2px var(--accent)" : undefined,
                }}
              />
            </Button>
          );
        })}
      </div>

      <div className="flex items-center bg-panel border border-border rounded-md shadow-soft p-0.5">
        <IconButton
          icon="content_copy"
          className="h-7 w-7 rounded-md text-muted hover:bg-surface2 hover:text-accent"
          title="Duplicate"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDuplicate();
          }}
        />
        <div className="w-px h-4 bg-border mx-0.5" />
        <IconButton
          icon="delete"
          className="h-7 w-7 rounded-md text-muted hover:bg-surface2 hover:text-error"
          title="Delete"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete();
          }}
        />
      </div>
    </div>
  );
}
