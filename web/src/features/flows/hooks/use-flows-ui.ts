
import { useState, useMemo } from "react";
import { FlowDTO, ProjectDTO } from "@/types/dto";
import { useAppStore, useMounted } from "@/hooks/use-app-store";
import { useWorkspaceStore } from "@/features/workspaces/store/use-workspace-store";

export type ConfirmState = { type: "archive" | "delete"; flow: FlowDTO } | null;

export function useFlowsUI(archivingId?: string, deletingId?: string) {
  const mounted = useMounted();
  const showSuccess = useAppStore((s) => s.showSuccess);
  const showError = useAppStore((s) => s.showError);
  const showInfo = useAppStore((s) => s.showInfo);

  // Workspace state
  const scopeRaw = useWorkspaceStore((s) => s.activeScope);
  const activeProjectIdRaw = useWorkspaceStore((s) => s.activeProjectId);
  const projects = useWorkspaceStore((s) => s.projects);
  const scope = mounted ? scopeRaw : "personal";
  const activeProjectId = mounted ? activeProjectIdRaw : null;
  const activeProject = useMemo(
    () => projects.find((p) => p.id === activeProjectId) || null,
    [activeProjectId, projects]
  );

  // Confirm dialog state
  const [confirm, setConfirm] = useState<ConfirmState>(null);

  const confirmTitle =
    confirm?.type === "archive" ? "Archive flow?" : confirm?.type === "delete" ? "Delete flow?" : "";

  const confirmDesc =
    confirm?.type === "archive"
      ? `This will mark "${confirm.flow.name}" as archived.`
      : confirm?.type === "delete"
        ? `This will permanently delete "${confirm.flow.name}".`
        : undefined;

  const confirmLoading =
    (confirm?.type === "archive" && archivingId === confirm.flow.id) ||
    (confirm?.type === "delete" && deletingId === confirm.flow.id);

  // Workspace-specific data
  const pageTitle =
    scope === "project" ? (activeProject ? `Project: ${activeProject.name}` : "Project Workflows") : "Personal Workflows";
  const pageSubtitle =
    scope === "project"
      ? activeProject
        ? "Workflows shared within this project."
        : "Select a project to view project workflows."
      : "Workflows owned by you.";

  const canCreateProject = scope === "project" && Boolean(activeProjectId);
  const projectLabel =
    scope === "project" && activeProject ? `Project workflow (${activeProject.name})` : "Project workflow";

  return {
    showSuccess,
    showError,
    showInfo,
    confirm,
    setConfirm,
    confirmTitle,
    confirmDesc,
    confirmLoading,
    scope,
    activeProjectId,
    activeProject,
    pageTitle,
    pageSubtitle,
    canCreateProject,
    projectLabel,
  };
}
