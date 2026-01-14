"use client";

import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import { useProjectSettingsPage } from "../hooks/use-project-settings-page";
import { ProjectDangerZoneCard } from "./project-settings/project-danger-zone-card";
import { ProjectDocsCard } from "./project-settings/project-docs-card";
import { ProjectInfoCard } from "./project-settings/project-info-card";
import { ProjectMembersCard } from "./project-settings/project-members-card";
import { ProjectSettingsHeader } from "./project-settings/project-settings-header";

export function ProjectSettingsPage({ projectId }: { projectId: string }) {
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
    navItems,
    docsLinks,
    projectInitials,
  } = useProjectSettingsPage(projectId);

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
