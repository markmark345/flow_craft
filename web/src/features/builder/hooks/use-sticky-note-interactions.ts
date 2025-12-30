"use client";

import { useEffect, useRef } from "react";
import type { StickyNote } from "@/features/builder/types";

type DragAction =
  | {
      kind: "move";
      noteId: string;
      startClientX: number;
      startClientY: number;
      startX: number;
      startY: number;
    }
  | {
      kind: "resize";
      noteId: string;
      startClientX: number;
      startClientY: number;
      startW: number;
      startH: number;
    };

function isTextInputActive() {
  const active = document.activeElement as HTMLElement | null;
  if (!active) return false;
  const tag = active.tagName.toLowerCase();
  if (tag === "input" || tag === "textarea") return true;
  return Boolean((active as any).isContentEditable);
}

type Params = {
  deleteNote: (noteId: string) => void;
  selectedNoteId?: string;
  setSelectedNote: (noteId?: string) => void;
  updateNote: (noteId: string, patch: Partial<StickyNote>) => void;
  zoom: number;
};

export function useStickyNoteInteractions({ deleteNote, selectedNoteId, setSelectedNote, updateNote, zoom }: Params) {
  const actionRef = useRef<DragAction | null>(null);
  const dragStyleRef = useRef<{ cursor: string; userSelect: string } | null>(null);

  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;

  const endAction = () => {
    actionRef.current = null;
    const prev = dragStyleRef.current;
    if (prev) {
      document.body.style.cursor = prev.cursor;
      document.body.style.userSelect = prev.userSelect;
      dragStyleRef.current = null;
    }
  };

  const beginAction = (next: DragAction) => {
    actionRef.current = next;
    if (!dragStyleRef.current) {
      dragStyleRef.current = {
        cursor: document.body.style.cursor,
        userSelect: document.body.style.userSelect,
      };
    }
    document.body.style.cursor = next.kind === "resize" ? "nwse-resize" : "grabbing";
    document.body.style.userSelect = "none";
  };

  useEffect(() => {
    if (!selectedNoteId) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (isTextInputActive()) return;
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        deleteNote(selectedNoteId);
      }
      if (e.key === "Escape") setSelectedNote(undefined);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [deleteNote, selectedNoteId, setSelectedNote]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const action = actionRef.current;
      if (!action) return;

      const currentZoom = zoomRef.current || 1;
      const dx = (e.clientX - action.startClientX) / currentZoom;
      const dy = (e.clientY - action.startClientY) / currentZoom;

      if (action.kind === "move") {
        updateNote(action.noteId, { x: action.startX + dx, y: action.startY + dy });
        return;
      }

      const minW = 280;
      const minH = 220;
      updateNote(action.noteId, {
        width: Math.max(minW, action.startW + dx),
        height: Math.max(minH, action.startH + dy),
      });
    };

    const onUp = () => {
      if (!actionRef.current) return;
      endAction();
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      endAction();
    };
  }, [updateNote]);

  return {
    beginAction,
    endAction,
  };
}
