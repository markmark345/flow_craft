import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/shared/hooks/use-app-store";
import { useAuthStore } from "@/features/auth/store/use-auth-store";
import { useResetWorkspace } from "./use-reset-workspace";
import { avatarStyle, initialsFor } from "../components/flows-page-utils";

export interface UseSettingsPageReturn {
  // State
  mounted: boolean;
  theme: ReturnType<typeof useAppStore.getState>["theme"];
  workspaceName: string;
  confirmResetOpen: boolean;
  savedWorkspaceName: string;
  reduceMotion: boolean;
  autoSaveFlows: boolean;
  resetting: boolean;

  // User data
  safeUser: ReturnType<typeof useAuthStore.getState>["user"] | undefined;
  profileName: string;
  profileEmail: string;
  profileAvatar: ReturnType<typeof avatarStyle>;
  workspaceId: string;

  // Actions
  setTheme: ReturnType<typeof useAppStore.getState>["setTheme"];
  setWorkspaceNameDraft: (name: string) => void;
  setConfirmResetOpen: (open: boolean) => void;
  setReduceMotion: ReturnType<typeof useAppStore.getState>["setReduceMotion"];
  setAutoSaveFlows: ReturnType<typeof useAppStore.getState>["setAutoSaveFlows"];
  copyWorkspaceId: () => Promise<void>;
  saveWorkspace: () => void;
  onClearLocalCache: () => void;
  onConfirmReset: () => Promise<void>;
  onSignOut: () => void;
  navigateTo: (path: string) => void;
  showInfo: ReturnType<typeof useAppStore.getState>["showInfo"];
}

/**
 * Custom hook for managing Settings Page state and logic.
 * Handles workspace settings, preferences, profile, and system actions.
 */
export function useSettingsPage(): UseSettingsPageReturn {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Store state
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);
  const showSuccess = useAppStore((s) => s.showSuccess);
  const showInfo = useAppStore((s) => s.showInfo);
  const showError = useAppStore((s) => s.showError);
  const savedWorkspaceName = useAppStore((s) => s.workspaceName);
  const reduceMotion = useAppStore((s) => s.reduceMotion);
  const autoSaveFlows = useAppStore((s) => s.autoSaveFlows);
  const setWorkspaceName = useAppStore((s) => s.setWorkspaceName);
  const setReduceMotion = useAppStore((s) => s.setReduceMotion);
  const setAutoSaveFlows = useAppStore((s) => s.setAutoSaveFlows);
  const clearLocalCache = useAppStore((s) => s.clearLocalCache);

  const signOut = useAuthStore((s) => s.signOut);
  const user = useAuthStore((s) => s.user);

  const { resetWorkspace, resetting } = useResetWorkspace();

  // Local state
  const [workspaceName, setWorkspaceNameDraft] = useState(savedWorkspaceName);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  // Effects
  useEffect(() => setWorkspaceNameDraft(savedWorkspaceName), [savedWorkspaceName]);
  useEffect(() => setMounted(true), []);

  // Computed values
  const workspaceId = useMemo(() => "ws_89234x_dev_2023", []);
  const safeUser = mounted ? user : undefined;
  const profileName = safeUser?.name || safeUser?.email || "Unknown";
  const profileEmail = safeUser?.email || "";
  const profileAvatar = useMemo(() => avatarStyle(profileName), [profileName]);

  // Actions
  const copyWorkspaceId = async () => {
    try {
      await navigator.clipboard.writeText(workspaceId);
      showSuccess("Copied", "Workspace ID copied to clipboard.");
    } catch (err: any) {
      showError("Copy failed", err?.message || "Unable to copy");
    }
  };

  const saveWorkspace = () => {
    const trimmed = workspaceName.trim();
    if (!trimmed) {
      showError("Save failed", "Workspace name is required.");
      return;
    }
    setWorkspaceName(trimmed);
    showSuccess("Saved", "Workspace updated.");
  };

  const onClearLocalCache = () => {
    clearLocalCache();
    showSuccess("Cleared", "Local cache cleared.");
  };

  const onConfirmReset = async () => {
    try {
      await resetWorkspace();
      setConfirmResetOpen(false);
    } catch {}
  };

  const onSignOut = () => {
    signOut();
    showSuccess("Signed out");
    router.replace("/login");
  };

  const navigateTo = (path: string) => {
    router.push(path as any);
  };

  return {
    // State
    mounted,
    theme,
    workspaceName,
    confirmResetOpen,
    savedWorkspaceName,
    reduceMotion,
    autoSaveFlows,
    resetting,

    // User data
    safeUser,
    profileName,
    profileEmail,
    profileAvatar,
    workspaceId,

    // Actions
    setTheme,
    setWorkspaceNameDraft,
    setConfirmResetOpen,
    setReduceMotion,
    setAutoSaveFlows,
    copyWorkspaceId,
    saveWorkspace,
    onClearLocalCache,
    onConfirmReset,
    onSignOut,
    navigateTo,
    showInfo,
  };
}
