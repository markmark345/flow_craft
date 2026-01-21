
import type { StateCreator } from "zustand";
import type { StickyNote } from "../../types";
import type { AuthUser } from "@/lib/auth";
import type { BuilderStore } from "../types";

export type NotesSlice = {
  notes: StickyNote[];
  setNotes: (notes: StickyNote[]) => void;
  addNote: (position: { x: number; y: number }, actor?: AuthUser) => void;
  updateNote: (id: string, patch: Partial<Omit<StickyNote, "id">>) => void;
  deleteNote: (id: string) => void;
  duplicateNote: (id: string, actor?: AuthUser) => void;
};

export const createNotesSlice: StateCreator<BuilderStore, [], [], NotesSlice> = (set, get) => ({
  notes: [],
  setNotes: (notes) => set({ notes, dirty: true }),
  addNote: (position, actor) => {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const note: StickyNote = {
      id,
      x: position.x,
      y: position.y,
      width: 360,
      height: 280,
      color: "yellow",
      text: "",
      collapsed: false,
      createdAt: actor ? now : undefined,
      createdBy: actor ? { id: actor.id, name: actor.name, email: actor.email } : undefined,
      updatedAt: actor ? now : undefined,
      updatedBy: actor ? { id: actor.id, name: actor.name, email: actor.email } : undefined,
    };
    set((state) => ({
      notes: [...state.notes, note],
      selectedNoteId: id,
      selectedNodeId: undefined,
      selectedEdgeId: undefined,
      dirty: true,
    }));
  },
  updateNote: (id, patch) =>
    set((state) => ({
      notes: state.notes.map((n) => (n.id === id ? { ...n, ...patch } : n)),
      dirty: true,
    })),
  deleteNote: (id) =>
    set((state) => ({
      notes: state.notes.filter((n) => n.id !== id),
      selectedNoteId: state.selectedNoteId === id ? undefined : state.selectedNoteId,
      dirty: true,
    })),
  duplicateNote: (id, actor) => {
    const src = get().notes.find((n) => n.id === id);
    if (!src) return;
    const newId = crypto.randomUUID();
    const now = new Date().toISOString();
    const copy: StickyNote = {
      ...src,
      id: newId,
      x: src.x + 30,
      y: src.y + 30,
      collapsed: false,
      createdAt: actor ? now : src.createdAt,
      createdBy: actor ? { id: actor.id, name: actor.name, email: actor.email } : src.createdBy,
      updatedAt: actor ? now : src.updatedAt,
      updatedBy: actor ? { id: actor.id, name: actor.name, email: actor.email } : src.updatedBy,
    };
    set((state) => ({
      notes: [...state.notes, copy],
      selectedNoteId: newId,
      selectedNodeId: undefined,
      selectedEdgeId: undefined,
      dirty: true,
    }));
  },
});
