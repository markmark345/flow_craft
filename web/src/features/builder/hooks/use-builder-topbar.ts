import { useEffect, useRef, useState } from "react";
import { getErrorMessage } from "@/lib/error-utils";
import { useBuilderStore } from "../store/use-builder-store";
import { useBuilderSave } from "./use-builder-save";
import { useAppStore, useDebounce, useMounted } from "@/hooks/use-app-store";
import { useRunFlow } from "@/features/runs/hooks/use-run-flow";
import { useAuthStore } from "@/features/auth/store/use-auth-store";
import { useLogout } from "@/features/auth/hooks/use-logout";

export interface UseBuilderTopbarReturn {
  name: string;
  dirty: boolean;
  flowId: string | undefined;
  save: (opts?: { silent?: boolean }) => Promise<void>;
  saving: boolean;
  startRun: (flowId: string) => Promise<{ id: string }>;
  running: boolean;
  showSuccess: (title: string, message?: string) => void;
  showInfo: (title: string, message?: string) => void;
  showError: (title: string, message?: string) => void;
  user: { id: string; name: string; email: string } | undefined;
  signOut: () => Promise<void>;
  signingOut: boolean;
  localName: string;
  setLocalName: (value: string) => void;
  menuOpen: boolean;
  setMenuOpen: (value: boolean | ((prev: boolean) => boolean)) => void;
  menuRef: React.RefObject<HTMLDivElement | null>;
  initials: string;
  setActiveRunId: (id: string | undefined) => void;
  onRun: () => Promise<void>;
}

/**
 * Custom hook for managing builder topbar state and interactions.
 * Handles name editing, auto-save, running flows, and user menu.
 */
export function useBuilderTopbar(): UseBuilderTopbarReturn {
  const mounted = useMounted();
  const name = useBuilderStore((s) => s.flowName);
  const setName = useBuilderStore((s) => s.setFlowName);
  const dirty = useBuilderStore((s) => s.dirty);
  const flowId = useBuilderStore((s) => s.flowId);
  const setActiveRunId = useBuilderStore((s) => s.setActiveRunId);
  const { save, saving } = useBuilderSave(flowId);
  const { startRun, running } = useRunFlow();
  const showSuccess = useAppStore((s) => s.showSuccess);
  const showInfo = useAppStore((s) => s.showInfo);
  const showError = useAppStore((s) => s.showError);
  const autoSaveFlows = useAppStore((s) => s.autoSaveFlows);
  const authUser = useAuthStore((s) => s.user);
  const user = mounted ? authUser : undefined;
  const { signOut, loading: signingOut } = useLogout();
  const [localName, setLocalName] = useState(name);
  const debounced = useDebounce(localName, 300);
  const saveRef = useRef(save);
  const savingRef = useRef(saving);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const initials = (() => {
    const n = (user?.name || "").trim();
    if (n) {
      const parts = n.split(/\s+/).filter(Boolean);
      return ((parts[0]?.[0] || "") + (parts[1]?.[0] || parts[0]?.[1] || "")).toUpperCase() || "U";
    }
    const e = (user?.email || "").trim();
    if (e) return e.slice(0, 2).toUpperCase();
    return "U";
  })();

  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!menuRef.current) return;
      if (menuRef.current.contains(e.target as Node)) return;
      setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  useEffect(() => setLocalName(name), [name]);
  useEffect(() => {
    if (debounced !== name) setName(debounced);
  }, [debounced, name, setName]);

  useEffect(() => {
    saveRef.current = save;
  }, [save]);
  useEffect(() => {
    savingRef.current = saving;
  }, [saving]);

  useEffect(() => {
    if (!autoSaveFlows) return;
    if (!flowId) return;

    const id = window.setInterval(() => {
      const state = useBuilderStore.getState();
      if (!state.dirty) return;
      if (savingRef.current) return;
      void saveRef.current({ silent: true });
    }, 60_000);

    return () => window.clearInterval(id);
  }, [autoSaveFlows, flowId]);

  const onRun = async () => {
    if (!flowId) return;
    try {
      if (dirty) await save();
      const run = await startRun(flowId);
      setActiveRunId(run.id);
      showSuccess("Run started", run.id.slice(0, 8));
    } catch (err: unknown) {
      showError("Run failed", getErrorMessage(err) || "Unable to start run");
    }
  };

  return {
    name,
    dirty,
    flowId,
    save,
    saving,
    startRun,
    running,
    showSuccess,
    showInfo,
    showError,
    user,
    signOut,
    signingOut,
    localName,
    setLocalName,
    menuOpen,
    setMenuOpen,
    menuRef,
    initials,
    setActiveRunId,
    onRun,
  };
}
