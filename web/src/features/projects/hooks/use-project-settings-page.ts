import { useMemo } from "react";
import { useWorkspaceStore } from "@/features/workspaces/store/use-workspace-store";
import { useProjectSettings } from "./use-project-settings";

export interface UseProjectSettingsPageReturn {
  // From use-project-settings hook
  addingMember: boolean;
  confirmDeleteOpen: boolean;
  deleting: boolean;
  description: string;
  hasChanges: boolean;
  isAdmin: boolean;
  loading: boolean;
  memberIdentifier: string;
  memberRole: "member" | "admin";
  members: ReturnType<typeof useProjectSettings>["members"];
  name: string;
  project: ReturnType<typeof useProjectSettings>["project"];
  saving: boolean;

  // Computed values
  navItems: Array<{ id: string; label: string; href: string; onClick?: () => void; active?: boolean }>;
  docsLinks: Array<{ label: string; href: string; icon: string }>;
  projectInitials: string;

  // Actions from use-project-settings
  onAddMember: () => Promise<void>;
  onCancel: () => void;
  onDeleteProject: () => Promise<void>;
  onRemoveMember: (memberId: string) => Promise<void>;
  onSave: () => Promise<void>;
  setConfirmDeleteOpen: (open: boolean) => void;
  setDescription: (description: string) => void;
  setMemberIdentifier: (identifier: string) => void;
  setMemberRole: (role: "member" | "admin") => void;
  setName: (name: string) => void;

  // Workspace action
  setActiveProject: ReturnType<typeof useWorkspaceStore.getState>["setActiveProject"];
}

/**
 * Custom hook for managing Project Settings Page state and logic.
 * Handles project info, members, and navigation.
 */
export function useProjectSettingsPage(projectId: string): UseProjectSettingsPageReturn {
  const setActiveProject = useWorkspaceStore((s) => s.setActiveProject);

  const projectSettings = useProjectSettings(projectId);

  const navItems = useMemo(
    () => [
      { id: "workflows", label: "Workflows", href: "/flows", onClick: () => setActiveProject(projectId) },
      {
        id: "credentials",
        label: "Credentials",
        href: `/projects/${projectId}/credentials`,
        onClick: () => setActiveProject(projectId),
      },
      { id: "executions", label: "Executions", href: "/runs", onClick: () => setActiveProject(projectId) },
      { id: "variables", label: "Variables", href: `/projects/${projectId}/variables` },
      { id: "settings", label: "Project Settings", href: `/projects/${projectId}/settings`, active: true },
    ],
    [projectId, setActiveProject]
  );

  const docsLinks = useMemo(
    () => [
      { label: "Managing Access Control", href: "/docs/authentication", icon: "person" },
      { label: "API Usage for Projects", href: "/docs/resources/workflows", icon: "terminal" },
      { label: "Exporting Project Data", href: "/docs/resources/executions", icon: "download" },
    ],
    []
  );

  const projectInitials = useMemo(() => {
    const value = (projectSettings.project?.name || "").trim();
    if (!value) return "PR";
    return value.slice(0, 2).toUpperCase();
  }, [projectSettings.project?.name]);

  return {
    // From use-project-settings
    addingMember: projectSettings.addingMember,
    confirmDeleteOpen: projectSettings.confirmDeleteOpen,
    deleting: projectSettings.deleting,
    description: projectSettings.description,
    hasChanges: projectSettings.hasChanges,
    isAdmin: projectSettings.isAdmin,
    loading: projectSettings.loading,
    memberIdentifier: projectSettings.memberIdentifier,
    memberRole: projectSettings.memberRole,
    members: projectSettings.members,
    name: projectSettings.name,
    project: projectSettings.project,
    saving: projectSettings.saving,

    // Computed
    navItems,
    docsLinks,
    projectInitials,

    // Actions
    onAddMember: projectSettings.onAddMember,
    onCancel: projectSettings.onCancel,
    onDeleteProject: projectSettings.onDeleteProject,
    onRemoveMember: projectSettings.onRemoveMember,
    onSave: projectSettings.onSave,
    setConfirmDeleteOpen: projectSettings.setConfirmDeleteOpen,
    setDescription: projectSettings.setDescription,
    setMemberIdentifier: projectSettings.setMemberIdentifier,
    setMemberRole: projectSettings.setMemberRole,
    setName: projectSettings.setName,
    setActiveProject,
  };
}
