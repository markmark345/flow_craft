"use client";

import { StickyNote } from "@/features/builder/types";
import { cn } from "@/lib/cn";
import {
  combineTitleAndBody,
  getNoteAccent,
  NOTE_VARIANTS,
  StickyNoteTheme,
} from "@/features/builder/lib/sticky-note-utils";
import { useStickyNoteCard } from "../../hooks/use-sticky-note-card";
import { NoteToolbar } from "./card/NoteToolbar";
import { NoteHeader } from "./card/NoteHeader";
import { NoteContent } from "./card/NoteContent";
import { NoteFooter } from "./card/NoteFooter";

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

  return (
    <div
      className="pointer-events-auto absolute group"
      style={{ left: note.x, top: note.y, width: note.width, height: note.height }}
      onPointerDown={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      <NoteToolbar
        note={note}
        onChangeColor={onChangeColor}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
      />

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
        <NoteHeader
          innerBorder={innerBorder}
          accent={accent}
          metaColor={metaColor}
          onStartMove={onStartMove}
        />

        <NoteContent
          title={titleBody.title}
          body={titleBody.body}
          onSelect={onSelect}
          onChangeTitle={(title) => onChangeText(combineTitleAndBody(title, titleBody.body))}
          onChangeBody={(body) => onChangeText(combineTitleAndBody(titleBody.title, body))}
        />

        <NoteFooter
          note={note}
          innerBorder={innerBorder}
          accent={accent}
          metaColor={metaColor}
          fg={variant.fg}
          onStartResize={onStartResize}
        />
      </div>
    </div>
  );
}

