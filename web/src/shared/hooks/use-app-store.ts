import { useEffect, useState } from "react";
import { ToastItem } from "@/shared/components/toast";
import { create } from "zustand";

type Theme = "light" | "dark";

type AppState = {
  theme: Theme;
  sidebarCollapsed: boolean;
  workspaceName: string;
  reduceMotion: boolean;
  autoSaveFlows: boolean;
  toasts: ToastItem[];
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setWorkspaceName: (name: string) => void;
  setReduceMotion: (v: boolean) => void;
  setAutoSaveFlows: (v: boolean) => void;
  clearLocalCache: () => void;
  addToast: (toast: Omit<ToastItem, "id">, durationMs?: number) => void;
  removeToast: (id: string) => void;
  showSuccess: (title: string, description?: string) => void;
  showInfo: (title: string, description?: string) => void;
  showError: (title: string, description?: string) => void;
};

type PersistedState = Pick<AppState, "theme" | "workspaceName" | "reduceMotion" | "autoSaveFlows">;

const PERSIST_KEY = "flowcraft.app.v1";

const defaultPersistedState: PersistedState = {
  theme: "light",
  workspaceName: "Engineering Team",
  reduceMotion: false,
  autoSaveFlows: true,
};

function readPersistedState(): Partial<PersistedState> {
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

function writePersistedState(next: PersistedState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PERSIST_KEY, JSON.stringify(next));
  } catch {
    // ignore persistence errors (private mode, storage disabled, etc)
  }
}

function toPersistedState(state: Pick<AppState, keyof PersistedState>): PersistedState {
  return {
    theme: state.theme,
    workspaceName: state.workspaceName,
    reduceMotion: state.reduceMotion,
    autoSaveFlows: state.autoSaveFlows,
  };
}

function clearPersistedState() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(PERSIST_KEY);
  } catch {
    // ignore
  }
}

const persisted = { ...defaultPersistedState, ...readPersistedState() };

export const useAppStore = create<AppState>((set) => ({
  theme: persisted.theme,
  sidebarCollapsed: false,
  workspaceName: persisted.workspaceName,
  reduceMotion: persisted.reduceMotion,
  autoSaveFlows: persisted.autoSaveFlows,
  toasts: [],
  setTheme: (theme) => {
    const current = useAppStore.getState();
    writePersistedState(toPersistedState({ ...current, theme }));
    set({ theme });
  },
  toggleTheme: () =>
    set((state) => {
      const theme: Theme = state.theme === "light" ? "dark" : "light";
      writePersistedState(toPersistedState({ ...state, theme }));
      return { theme };
    }),
  setWorkspaceName: (workspaceName) => {
    const current = useAppStore.getState();
    writePersistedState(toPersistedState({ ...current, workspaceName }));
    set({ workspaceName });
  },
  setReduceMotion: (reduceMotion) => {
    const current = useAppStore.getState();
    writePersistedState(toPersistedState({ ...current, reduceMotion }));
    set({ reduceMotion });
  },
  setAutoSaveFlows: (autoSaveFlows) => {
    const current = useAppStore.getState();
    writePersistedState(toPersistedState({ ...current, autoSaveFlows }));
    set({ autoSaveFlows });
  },
  clearLocalCache: () => {
    clearPersistedState();
    set({ ...defaultPersistedState });
  },
  addToast: (toast, durationMs = 2500) => {
    const id = crypto.randomUUID();
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, durationMs);
  },
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
  showSuccess: (title, description) =>
    useAppStore.getState().addToast({ title, description, tone: "success" }),
  showInfo: (title, description) =>
    useAppStore.getState().addToast({ title, description, tone: "info" }),
  showError: (title, description) =>
    useAppStore.getState().addToast({ title, description, tone: "error" }),
}));

export function useThemeSync() {
  const theme = useAppStore((s) => s.theme);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);
}

export function useDebounce<T>(value: T, delay = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return v;
}

export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
