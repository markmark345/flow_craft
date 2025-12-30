"use client";

import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import { useWorkspaceStore } from "@/features/workspaces/store/use-workspace-store";
import { useMemo } from "react";

import { useProjectSettings } from "@/features/projects/hooks/use-project-settings";
import { ProjectDangerZoneCard } from "@/features/projects/components/project-settings/project-danger-zone-card";
import { ProjectDocsCard } from "@/features/projects/components/project-settings/project-docs-card";
import { ProjectInfoCard } from "@/features/projects/components/project-settings/project-info-card";
import { ProjectMembersCard } from "@/features/projects/components/project-settings/project-members-card";
import { ProjectSettingsHeader } from "@/features/projects/components/project-settings/project-settings-header";

export function ProjectSettingsPage({ projectId }: { projectId: string }) {
  const setActiveProject = useWorkspaceStore((s) => s.setActiveProject);

  const {
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
  } = useProjectSettings(projectId);

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
    const value = (project?.name || "").trim();
    if (!value) return "PR";
    return value.slice(0, 2).toUpperCase();
  }, [project?.name]);

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-[1200px] mx-auto text-sm text-muted">Loading project...</div>
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="min-h-screen bg-bg">
      <div className="px-8 py-8">
        <div className="max-w-[1200px] mx-auto space-y-6">
          <ProjectSettingsHeader
            projectName={project.name}
            projectInitials={projectInitials}
            navItems={navItems}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2 space-y-6">
              <ProjectInfoCard
                name={name}
                description={description}
                onNameChange={setName}
                onDescriptionChange={setDescription}
                hasChanges={hasChanges}
                isAdmin={isAdmin}
                saving={saving}
                onCancel={onCancel}
                onSave={onSave}
              />

              <ProjectMembersCard
                addingMember={addingMember}
                isAdmin={isAdmin}
                memberIdentifier={memberIdentifier}
                memberRole={memberRole}
                members={members}
                onAddMember={onAddMember}
                onMemberIdentifierChange={setMemberIdentifier}
                onMemberRoleChange={setMemberRole}
                onRemoveMember={onRemoveMember}
              />
            </div>

            <div className="lg:col-span-1 space-y-6">
              <ProjectDangerZoneCard isAdmin={isAdmin} onDeleteRequest={() => setConfirmDeleteOpen(true)} />
              <ProjectDocsCard links={docsLinks} />
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDeleteOpen}
        title="Delete this project?"
        description={`This will permanently delete "${project.name}" and all workflows inside it.`}
        confirmLabel="Delete"
        confirmVariant="danger"
        loading={deleting}
        onConfirm={onDeleteProject}
        onClose={() => setConfirmDeleteOpen(false)}
      />
    </div>
  );
}
