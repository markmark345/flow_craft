"use client";

import { useViewport } from "reactflow";

import { useAuthStore } from "@/features/auth/store/use-auth-store";
import { useAppStore } from "@/shared/hooks/use-app-store";

import { useBuilderStore } from "../../store/use-builder-store";
import { useStickyNoteInteractions } from "../../hooks/use-sticky-note-interactions";
import { useStickyNotesLayer } from "../../hooks/use-sticky-notes-layer";
import { StickyNoteTheme } from "../../lib/sticky-note-utils";
import { StickyNoteCard } from "./card";

export function StickyNotesLayer() {
  const viewport = useViewport();
  const notes = useBuilderStore((s) => s.notes);
  const selectedNoteId = useBuilderStore((s) => s.selectedNoteId);
  const setSelectedNote = useBuilderStore((s) => s.setSelectedNote);
  const updateNote = useBuilderStore((s) => s.updateNote);
  const deleteNote = useBuilderStore((s) => s.deleteNote);
  const duplicateNote = useBuilderStore((s) => s.duplicateNote);

  const theme = useAppStore((s) => s.theme) as StickyNoteTheme;
  const user = useAuthStore((s) => s.user);

  const { transform, zoom } = useStickyNotesLayer(viewport);

  const { beginAction } = useStickyNoteInteractions({
    deleteNote,
    selectedNoteId: selectedNoteId || undefined,
    setSelectedNote,
    updateNote,
    zoom,
  });

  return (
    <div className="absolute inset-0 pointer-events-none z-[4]">
      <div className="absolute inset-0" style={{ transform, transformOrigin: "0 0" }}>
        {notes.map((note) => (
          <StickyNoteCard
            key={note.id}
            note={note}
            selected={note.id === selectedNoteId}
            theme={theme}
            onSelect={() => setSelectedNote(note.id)}
            onStartMove={(e) => {
              setSelectedNote(note.id);
              beginAction({
                kind: "move",
                noteId: note.id,
                startClientX: e.clientX,
                startClientY: e.clientY,
                startX: note.x,
                startY: note.y,
              });
            }}
            onStartResize={(e) => {
              setSelectedNote(note.id);
              beginAction({
                kind: "resize",
                noteId: note.id,
                startClientX: e.clientX,
                startClientY: e.clientY,
                startW: note.width,
                startH: note.height,
              });
            }}
            onChangeText={(text) =>
              updateNote(note.id, {
                text,
                collapsed: false,
                updatedAt: user ? new Date().toISOString() : note.updatedAt,
                updatedBy: user ? { id: user.id, name: user.name, email: user.email } : note.updatedBy,
              })
            }
            onChangeColor={(color) =>
              updateNote(note.id, {
                color,
                collapsed: false,
                updatedAt: user ? new Date().toISOString() : note.updatedAt,
                updatedBy: user ? { id: user.id, name: user.name, email: user.email } : note.updatedBy,
              })
            }
            onDuplicate={() => duplicateNote(note.id, user)}
            onDelete={() => deleteNote(note.id)}
          />
        ))}
      </div>
    </div>
  );
}

