"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/shared/components/button";
import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import { Input } from "@/shared/components/input";
import { Select } from "@/shared/components/select";
import { Icon } from "@/shared/components/icon";
import { cn } from "@/shared/lib/cn";
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

export function ProjectSettingsPage({ projectId }: { projectId: string }) {
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
  const [memberRole, setMemberRole] = useState<"admin" | "member">("member");
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

  const hasChanges = project
    ? name.trim() !== (project.name || "") || description.trim() !== (project.description || "")
    : false;

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

  const projectInitials = (() => {
    const value = (project?.name || "").trim();
    if (!value) return "PR";
    return value.slice(0, 2).toUpperCase();
  })();

  const memberInitials = (member: ProjectMemberDTO) => {
    const nameValue = (member.user.name || "").trim();
    if (nameValue) {
      const parts = nameValue.split(/\s+/).filter(Boolean);
      return ((parts[0]?.[0] || "") + (parts[1]?.[0] || parts[0]?.[1] || "")).toUpperCase() || "U";
    }
    const email = (member.user.email || "").trim();
    if (email) return email.slice(0, 2).toUpperCase();
    return "U";
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-[1200px] mx-auto text-sm text-muted">Loading project...</div>
      </div>
    );
  }

  if (!project) return null;

  const inviteDisabled = !isAdmin || addingMember || !memberIdentifier.trim();

  return (
    <div className="min-h-screen bg-bg">
      <div className="px-8 py-8">
        <div className="max-w-[1200px] mx-auto space-y-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-surface2 px-2 py-1">
                <span className="size-5 rounded-md bg-surface border border-border flex items-center justify-center text-[10px] font-semibold text-muted">
                  {projectInitials}
                </span>
                <span className="max-w-[220px] truncate">{project.name}</span>
              </span>
              <Icon name="chevron_right" className="text-[14px]" />
              <span className="text-text">Settings</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-text">Project Settings</h1>
            <p className="text-sm text-muted">Manage your project details, members, and advanced options.</p>
            <div className="mt-4 border-b border-border flex gap-6 overflow-x-auto">
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={item.onClick}
                  className={cn(
                    "pb-3 text-sm font-medium transition-colors whitespace-nowrap",
                    item.active
                      ? "text-accent border-b-2 border-accent"
                      : "text-muted hover:text-text border-b-2 border-transparent"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2 space-y-6">
              <section className="bg-panel border border-border rounded-xl shadow-soft overflow-hidden">
                <div className="px-6 py-5 border-b border-border flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-text">Project Info</h2>
                    <p className="text-xs text-muted mt-1">Update project name and description.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={onCancel}
                      disabled={!isAdmin || !hasChanges || saving}
                      className="rounded-lg"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={onSave}
                      disabled={!isAdmin || !hasChanges || saving}
                      className="rounded-lg"
                    >
                      {saving ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </div>
                <div className="p-6 space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-muted">Icon and name</label>
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-lg border border-border bg-surface2 flex items-center justify-center text-muted">
                        <Icon name="grid_view" className="text-[18px]" />
                      </div>
                      <Input
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        className="h-10 rounded-lg bg-surface2"
                        placeholder="Enter project name"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-muted">Description</label>
                    <textarea
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      className="min-h-[96px] w-full rounded-lg bg-surface2 border border-border px-3 py-2 text-sm text-text placeholder:text-muted focus:outline-none focus:shadow-focus"
                      placeholder="What is this project about?"
                    />
                  </div>
                  <div className="text-xs text-muted">Only admins can update project settings.</div>
                </div>
              </section>

              <section className="bg-panel border border-border rounded-xl shadow-soft overflow-hidden">
                <div className="px-6 py-5 border-b border-border">
                  <h2 className="text-lg font-semibold text-text">Project Members</h2>
                  <p className="text-xs text-muted mt-1">Manage who has access to this project.</p>
                </div>
                <div className="p-6 space-y-6">
                  <form
                    className="space-y-3"
                    onSubmit={(event) => {
                      event.preventDefault();
                      if (!inviteDisabled) {
                        onAddMember();
                      }
                    }}
                  >
                    <label className="block text-xs font-semibold text-muted">Invite members</label>
                    <div className="relative">
                      <Icon
                        name="search"
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[16px] text-muted"
                      />
                      <Input
                        value={memberIdentifier}
                        onChange={(event) => setMemberIdentifier(event.target.value)}
                        className="h-10 rounded-lg bg-surface2 pl-9 pr-24"
                        placeholder="Add users by email..."
                      />
                      <Button
                        type="submit"
                        size="sm"
                        disabled={inviteDisabled}
                        className="absolute right-1 top-1 h-8 px-3 text-xs rounded-md"
                      >
                        {addingMember ? "Inviting..." : "Invite"}
                      </Button>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="text-xs font-semibold text-muted">Role</div>
                      <Select
                        value={memberRole}
                        onChange={(value) => setMemberRole(value as any)}
                        options={[
                          { value: "member", label: "Member" },
                          { value: "admin", label: "Admin" },
                        ]}
                        className={cn("sm:w-[200px]", !isAdmin ? "opacity-60 pointer-events-none" : "")}
                      />
                    </div>
                  </form>

                  <div className="border border-border rounded-xl overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-surface2 text-xs uppercase text-muted">
                        <tr>
                          <th className="px-6 py-3 font-semibold">User</th>
                          <th className="px-6 py-3 font-semibold text-right">Role</th>
                          <th className="px-6 py-3" />
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {members.length === 0 ? (
                          <tr>
                            <td className="px-6 py-6 text-sm text-muted" colSpan={3}>
                              No members yet.
                            </td>
                          </tr>
                        ) : (
                          members.map((member) => {
                            const roleLabel = member.role === "admin" ? "Admin" : "Member";
                            const roleClass =
                              member.role === "admin"
                                ? "border-[color-mix(in_srgb,var(--accent)_30%,transparent)] bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] text-accent"
                                : "border-border bg-surface2 text-muted";
                            return (
                              <tr key={member.user.id}>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="size-8 rounded-full bg-surface2 border border-border flex items-center justify-center text-xs font-semibold text-muted">
                                      {memberInitials(member)}
                                    </div>
                                    <div className="min-w-0">
                                      <div className="text-sm font-medium text-text truncate">
                                        {member.user.name || member.user.email}
                                      </div>
                                      <div className="text-xs text-muted truncate">{member.user.email}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <span
                                    className={cn(
                                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border",
                                      roleClass
                                    )}
                                  >
                                    {roleLabel}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    disabled={!isAdmin}
                                    className="text-muted hover:text-red"
                                    onClick={() => onRemoveMember(member.user.id)}
                                    title="Remove member"
                                  >
                                    <Icon name="close" className="text-[16px]" />
                                  </Button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            </div>

            <div className="lg:col-span-1 space-y-6">
              <section className="bg-panel border border-[color-mix(in_srgb,var(--error)_35%,var(--border))] rounded-xl shadow-soft overflow-hidden">
                <div
                  className="px-6 py-5 border-b border-[color-mix(in_srgb,var(--error)_35%,var(--border))]"
                  style={{ background: "color-mix(in srgb, var(--error) 10%, transparent)" }}
                >
                  <h2 className="text-lg font-semibold text-red">Danger Zone</h2>
                </div>
                <div className="p-6 space-y-4">
                  <p className="text-sm text-text">
                    Deleting a project is irreversible. You can also choose to move all workflows and credentials to
                    another project before deletion.
                  </p>
                  <div className="flex items-start gap-2 text-xs text-muted">
                    <Icon name="info" className="text-[14px]" />
                    <span>All active workflows will be stopped immediately.</span>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => setConfirmDeleteOpen(true)}
                    disabled={!isAdmin}
                    className="w-full border border-[color-mix(in_srgb,var(--error)_35%,transparent)] text-red hover:bg-[color-mix(in_srgb,var(--error)_8%,transparent)]"
                  >
                    Delete this project
                  </Button>
                </div>
              </section>

              <section className="bg-panel border border-border rounded-xl shadow-soft p-6">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">Documentation</h3>
                <ul className="mt-4 space-y-3">
                  {docsLinks.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="flex items-center gap-2 text-sm text-accent hover:underline">
                        <Icon name={link.icon} className="text-[16px]" />
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
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
