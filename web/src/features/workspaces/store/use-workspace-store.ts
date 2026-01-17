"use client";

import { create } from "zustand";
import { ProjectDTO } from "@/types/dto";
import { listProjects } from "@/features/projects/services/projectsApi";

export type WorkspaceScope = "personal" | "project";

type WorkspaceState = {
  activeScope: WorkspaceScope;
  activeProjectId: string | null;
  projects: ProjectDTO[];
  loadingProjects: boolean;
  setScope: (scope: WorkspaceScope) => void;
  setActiveProject: (projectId: string) => void;
  loadProjects: () => Promise<void>;
};

type PersistedState = Pick<WorkspaceState, "activeScope" | "activeProjectId">;

const PERSIST_KEY = "flowcraft.workspace.v1";

const defaultPersisted: PersistedState = {
  activeScope: "personal",
  activeProjectId: null,
};

function readPersisted(): Partial<PersistedState> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(PERSIST_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writePersisted(next: PersistedState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PERSIST_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

const persisted = { ...defaultPersisted, ...readPersisted() };

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  activeScope: persisted.activeScope,
  activeProjectId: persisted.activeProjectId,
  projects: [],
  loadingProjects: false,
  setScope: (scope) =>
    set((state) => {
      const next: PersistedState = {
        activeScope: scope,
        activeProjectId: scope === "personal" ? null : state.activeProjectId,
      };
      writePersisted(next);
      return { ...next };
    }),
  setActiveProject: (projectId) =>
    set(() => {
      const next: PersistedState = { activeScope: "project", activeProjectId: projectId };
      writePersisted(next);
      return { ...next };
    }),
  loadProjects: async () => {
    set({ loadingProjects: true });
    try {
      const projects = await listProjects();
      set({ projects });
      const { activeScope, activeProjectId } = get();
      if (activeScope === "project") {
        const exists = activeProjectId && projects.some((p) => p.id === activeProjectId);
        if (!exists) {
          const next: PersistedState = { activeScope: "personal", activeProjectId: null };
          writePersisted(next);
          set({ ...next });
        }
      }
    } finally {
      set({ loadingProjects: false });
    }
  },
}));

