"use client";

import { useEffect, useMemo, useRef } from "react";
import { useViewport } from "reactflow";
import { useBuilderStore } from "../store/use-builder-store";
import { StickyNote } from "../types";
import { cn } from "@/shared/lib/cn";
import { Icon } from "@/shared/components/icon";
import { useAppStore } from "@/shared/hooks/use-app-store";
import { useAuthStore } from "@/features/auth/store/use-auth-store";

type Theme = "light" | "dark";

const NOTE_COLOR_OPTIONS: Array<StickyNote["color"]> = ["yellow", "blue", "green"];

const NOTE_PREVIEW_BG: Record<StickyNote["color"], string> = {
  yellow: "#FEFCE8",
  blue: "#f0f9ff",
  green: "#ecfdf5",
};

const NOTE_VARIANTS: Record<
  StickyNote["color"],
  {
    light: { bg: string; border: string; fg: string };
    dark: { bg: string; border: string; fg: string };
  }
> = {
  yellow: {
    light: { bg: "#FEFCE8", border: "#FEF08A", fg: "#0f172a" },
    dark: { bg: "#332f0e", border: "#5a521a", fg: "#fefce8" },
  },
  blue: {
    light: { bg: "#f0f9ff", border: "#bae6fd", fg: "#0f172a" },
    dark: { bg: "rgba(12, 74, 110, 0.40)", border: "#075985", fg: "#f8fafc" },
  },
  green: {
    light: { bg: "#ecfdf5", border: "#a7f3d0", fg: "#0f172a" },
    dark: { bg: "#064e3b", border: "#065f46", fg: "#ecfdf5" },
  },
};

function getNoteAccent(color: StickyNote["color"]) {
  if (color === "green") return "var(--success)";
  if (color === "yellow") return "var(--warning)";
  return "var(--accent)";
}

function splitTitleAndBody(text: string) {
  const normalized = text.replace(/\r\n/g, "\n");
  const delimiter = "\n\n";
  const idx = normalized.indexOf(delimiter);
  if (idx === -1) return { title: "", body: normalized };
  return { title: normalized.slice(0, idx), body: normalized.slice(idx + delimiter.length) };
}

function combineTitleAndBody(title: string, body: string) {
  const t = title.replace(/\r\n/g, "\n");
  const b = body.replace(/\r\n/g, "\n");
  if (!t) return b;
  return `${t}\n\n${b}`;
}

function initialsFor(user?: { name?: string; email?: string }) {
  const name = (user?.name || "").trim();
  if (name) {
    const parts = name.split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] || "";
    const second = (parts[1]?.[0] || parts[0]?.[1] || "").trim();
    return (first + second).toUpperCase() || "U";
  }
  const email = (user?.email || "").trim();
  if (email) return email.slice(0, 2).toUpperCase();
  return "U";
}

function formatRelative(iso?: string) {
  if (!iso) return "—";
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return "—";
  const diff = Date.now() - t;
  if (diff < 60_000) return "Just now";
  if (diff < 60 * 60_000) return `${Math.floor(diff / 60_000)} mins ago`;
  if (diff < 24 * 60 * 60_000) return `${Math.floor(diff / (60 * 60_000))} hours ago`;
  return `${Math.floor(diff / (24 * 60 * 60_000))} days ago`;
}

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

export function StickyNotesLayer() {
  const viewport = useViewport();
  const notes = useBuilderStore((s) => s.notes);
  const selectedNoteId = useBuilderStore((s) => s.selectedNoteId);
  const setSelectedNote = useBuilderStore((s) => s.setSelectedNote);
  const updateNote = useBuilderStore((s) => s.updateNote);
  const deleteNote = useBuilderStore((s) => s.deleteNote);
  const duplicateNote = useBuilderStore((s) => s.duplicateNote);
  const theme = useAppStore((s) => s.theme) as Theme;
  const user = useAuthStore((s) => s.user);

  const actionRef = useRef<DragAction | null>(null);
  const dragStyleRef = useRef<{ cursor: string; userSelect: string } | null>(null);

  const zoom = viewport.zoom || 1;
  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;
  const transform = useMemo(
    () => `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
    [viewport.x, viewport.y, viewport.zoom]
  );

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

function StickyNoteCard({
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
}: {
  note: StickyNote;
  selected: boolean;
  theme: Theme;
  onSelect: () => void;
  onStartMove: (e: React.PointerEvent) => void;
  onStartResize: (e: React.PointerEvent) => void;
  onChangeText: (text: string) => void;
  onChangeColor: (color: StickyNote["color"]) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const variant = NOTE_VARIANTS[note.color]?.[theme] ?? NOTE_VARIANTS.yellow[theme];
  const accent = getNoteAccent(note.color);
  const innerBorder = `color-mix(in srgb, ${variant.border} 55%, var(--border))`;
  const metaColor = `color-mix(in srgb, ${variant.fg} 55%, transparent)`;

  const titleBody = useMemo(() => splitTitleAndBody(note.text), [note.text]);
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
                  {by.name} • {formatRelative(when)}
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
                <path
                  d="M6 9L9 6M3 9L9 3"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
