"use client";

import { StickyNote } from "@/features/builder/types";
import { cn } from "@/shared/lib/cn";
import { Icon } from "@/shared/components/icon";
import {
  combineTitleAndBody,
  formatRelative,
  getNoteAccent,
  initialsFor,
  NOTE_COLOR_OPTIONS,
  NOTE_PREVIEW_BG,
  NOTE_VARIANTS,
  StickyNoteTheme,
} from "@/features/builder/lib/sticky-note-utils";
import { useStickyNoteCard } from "../../hooks/use-sticky-note-card";

type Props = {
  note: StickyNote;
  selected: boolean;
  theme: StickyNoteTheme;
  onSelect: () => void;
  onStartMove: (e: React.PointerEvent) => void;
  onStartResize: (e: React.PointerEvent) => void;
  onChangeText: (text: string) => void;
  onChangeColor: (color: StickyNote["color"]) => void;
  onDuplicate: () => void;
  onDelete: () => void;
};

export function StickyNoteCard({
  note,
  selected,
  theme,
  onSelect,
  onStartMove,
  onStartResize,
  onChangeText,
  onChangeColor,
  onDuplicate,
  onDelete,
}: Props) {
  const variant = NOTE_VARIANTS[note.color]?.[theme] ?? NOTE_VARIANTS.yellow[theme];
  const accent = getNoteAccent(note.color);
  const innerBorder = `color-mix(in srgb, ${variant.border} 55%, var(--border))`;
  const metaColor = `color-mix(in srgb, ${variant.fg} 55%, transparent)`;

  const { titleBody } = useStickyNoteCard(note.text);
  const showTitle = true;
  const by = note.updatedBy || note.createdBy;
  const when = note.updatedAt || note.createdAt;

  return (
    <div
      className="pointer-events-auto absolute group"
      style={{ left: note.x, top: note.y, width: note.width, height: note.height }}
      onPointerDown={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {/* Hover toolbar */}
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
              <button
                key={c}
                type="button"
                className={cn("h-7 w-7 inline-flex items-center justify-center rounded-md hover:bg-surface2")}
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
              </button>
            );
          })}
        </div>

        <div className="flex items-center bg-panel border border-border rounded-md shadow-soft p-0.5">
          <button
            type="button"
            className="h-7 w-7 inline-flex items-center justify-center rounded-md text-muted hover:bg-surface2 hover:text-accent"
            title="Duplicate"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDuplicate();
            }}
          >
            <Icon name="content_copy" className="text-[16px]" />
          </button>
          <div className="w-px h-4 bg-border mx-0.5" />
          <button
            type="button"
            className="h-7 w-7 inline-flex items-center justify-center rounded-md text-muted hover:bg-surface2 hover:text-error"
            title="Delete"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete();
            }}
          >
            <Icon name="delete" className="text-[16px]" />
          </button>
        </div>
      </div>

      <div
        className={cn(
          "flex h-full w-full flex-col rounded-lg border overflow-hidden transition-shadow duration-200",
          selected ? "shadow-lift" : "shadow-soft group-hover:shadow-lift"
        )}
        style={{
          background: variant.bg,
          borderColor: variant.border,
          color: variant.fg,
          boxShadow: selected ? "var(--glow-accent), var(--shadow-lift)" : undefined,
        }}
      >
        {/* Header / drag handle */}
        <div
          className="flex items-center justify-between px-4 py-2.5 cursor-grab active:cursor-grabbing select-none border-b"
          style={{ borderColor: innerBorder }}
          title="Drag to move"
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onStartMove(e);
          }}
        >
          <div className="flex items-center gap-2" style={{ color: accent }}>
            <Icon name="sticky_note" className="text-[18px]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.18em]">Note</span>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="w-10 h-1 rounded-full" style={{ background: metaColor }} />
          </div>
          <div className="w-6" />
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 p-5 pt-4 flex flex-col gap-2">
          {showTitle ? (
            <input
              value={titleBody.title}
              onChange={(e) => onChangeText(combineTitleAndBody(e.target.value, titleBody.body))}
              onPointerDown={(e) => {
                e.stopPropagation();
                onSelect();
              }}
              onFocus={onSelect}
              className="w-full bg-transparent border-0 border-b border-transparent focus:border-border p-0 outline-none text-lg font-bold placeholder:text-muted"
              placeholder="Note title"
            />
          ) : null}

          <textarea
            value={titleBody.body}
            onChange={(e) => onChangeText(combineTitleAndBody(titleBody.title, e.target.value))}
            onPointerDown={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            onFocus={onSelect}
            spellCheck={false}
            className="w-full flex-1 min-h-0 bg-transparent border-0 p-0 resize-none outline-none text-sm leading-6 placeholder:text-muted"
            placeholder="Write something..."
          />
        </div>

        {/* Footer */}
        <div
          className="px-4 py-3 flex items-center justify-between border-t select-none"
          style={{ borderColor: innerBorder }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold"
              style={{
                background: `color-mix(in srgb, ${accent} 18%, transparent)`,
                color: `color-mix(in srgb, ${accent} 80%, ${variant.fg})`,
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
            <button
              type="button"
              className={cn(
                "h-6 w-6 inline-flex items-center justify-center cursor-nwse-resize rounded-md",
                "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity",
                "text-muted hover:text-text hover:bg-surface2"
              )}
              title="Resize"
              onPointerDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onStartResize(e);
              }}
            >
              <svg width="14" height="14" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 9L9 6M3 9L9 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

