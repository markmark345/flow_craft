"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useAppStore } from "@/shared/hooks/use-app-store";
import { useWorkspaceStore } from "@/features/workspaces/store/use-workspace-store";
import {
  addProjectMember,
  deleteProject,
  getProject,
  listProjectMembers,
  removeProjectMember,
  updateProject,
} from "@/features/projects/services/projectsApi";
import { ProjectDTO, ProjectMemberDTO } from "@/shared/types/dto";

type MemberRole = "admin" | "member";

export function useProjectSettings(projectId: string) {
  const router = useRouter();
  const showError = useAppStore((s) => s.showError);
  const showSuccess = useAppStore((s) => s.showSuccess);

  const refreshProjects = useWorkspaceStore((s) => s.loadProjects);
  const setScope = useWorkspaceStore((s) => s.setScope);
  const setActiveProject = useWorkspaceStore((s) => s.setActiveProject);

  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<ProjectDTO | null>(null);
  const [members, setMembers] = useState<ProjectMemberDTO[]>([]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const [memberIdentifier, setMemberIdentifier] = useState("");
  const [memberRole, setMemberRole] = useState<MemberRole>("member");
  const [addingMember, setAddingMember] = useState(false);

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isAdmin = project?.role === "admin";

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const p = await getProject(projectId);
        setProject(p);
        setName(p.name || "");
        setDescription(p.description || "");
        setActiveProject(p.id);
        const ms = await listProjectMembers(projectId);
        setMembers(ms);
      } catch (err: any) {
        showError("Load failed", err?.message || "Unable to load project");
        router.replace("/flows");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [projectId, router, setActiveProject, showError]);

  useEffect(() => {
    if (loading) return;
    if (project && project.role !== "admin") {
      showError("Forbidden", "Only project admins can access settings.");
      router.replace("/flows");
    }
  }, [loading, project, router, showError]);

  const hasChanges = useMemo(() => {
    if (!project) return false;
    return name.trim() !== (project.name || "") || description.trim() !== (project.description || "");
  }, [description, name, project]);

  const onCancel = () => {
    if (!project) return;
    setName(project.name || "");
    setDescription(project.description || "");
  };

  const onSave = async () => {
    const nextName = name.trim();
    if (!nextName) {
      showError("Save failed", "Project name is required.");
      return;
    }
    setSaving(true);
    try {
      const updated = await updateProject(projectId, { name: nextName, description: description.trim() || "" });
      setProject(updated);
      setName(updated.name || "");
      setDescription(updated.description || "");
      showSuccess("Saved", "Project updated.");
      await refreshProjects();
    } catch (err: any) {
      showError("Save failed", err?.message || "Unable to save project");
    } finally {
      setSaving(false);
    }
  };

  const onAddMember = async () => {
    const ident = memberIdentifier.trim();
    if (!ident) {
      showError("Add member failed", "Email or username is required.");
      return;
    }
    setAddingMember(true);
    try {
      await addProjectMember(projectId, { identifier: ident, role: memberRole });
      setMemberIdentifier("");
      const ms = await listProjectMembers(projectId);
      setMembers(ms);
      showSuccess("Member added");
    } catch (err: any) {
      showError("Add member failed", err?.message || "Unable to add member");
    } finally {
      setAddingMember(false);
    }
  };

  const onRemoveMember = async (userId: string) => {
    try {
      await removeProjectMember(projectId, userId);
      setMembers((prev) => prev.filter((m) => m.user.id !== userId));
      showSuccess("Member removed");
    } catch (err: any) {
      showError("Remove failed", err?.message || "Unable to remove member");
    }
  };

  const onDeleteProject = async () => {
    setDeleting(true);
    try {
      await deleteProject(projectId);
      await refreshProjects();
      setScope("personal");
      showSuccess("Project deleted");
      router.replace("/flows");
    } catch (err: any) {
      showError("Delete failed", err?.message || "Unable to delete project");
    } finally {
      setDeleting(false);
      setConfirmDeleteOpen(false);
    }
  };

  return {
    addingMember,
    confirmDeleteOpen,
    deleting,
    description,
    hasChanges,
    isAdmin,
    loading,
    memberIdentifier,
    memberRole,
    members,
    name,
    onAddMember,
    onCancel,
    onDeleteProject,
    onRemoveMember,
    onSave,
    project,
    saving,
    setConfirmDeleteOpen,
    setDescription,
    setMemberIdentifier,
    setMemberRole,
    setName,
  };
}

