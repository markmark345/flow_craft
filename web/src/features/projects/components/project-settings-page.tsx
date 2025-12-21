"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/shared/components/button";
import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import { Input } from "@/shared/components/input";
import { Select } from "@/shared/components/select";
import { Tabs } from "@/shared/components/tabs";
import { useAppStore } from "@/shared/hooks/use-app-store";

import {
  addProjectMember,
  deleteProject,
  getProject,
  listProjectMembers,
  removeProjectMember,
  updateProject,
} from "@/features/projects/services/projectsApi";
import { ProjectDTO, ProjectMemberDTO } from "@/shared/types/dto";
import { useWorkspaceStore } from "@/features/workspaces/store/use-workspace-store";

type TabId = "general" | "members" | "danger";

export function ProjectSettingsPage({ projectId }: { projectId: string }) {
  const router = useRouter();
  const showError = useAppStore((s) => s.showError);
  const showSuccess = useAppStore((s) => s.showSuccess);

  const refreshProjects = useWorkspaceStore((s) => s.loadProjects);
  const setScope = useWorkspaceStore((s) => s.setScope);

  const [tab, setTab] = useState<TabId>("general");
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
  }, [projectId, router, showError]);

  useEffect(() => {
    if (loading) return;
    if (project && project.role !== "admin") {
      showError("Forbidden", "Only project admins can access settings.");
      router.replace("/flows");
    }
  }, [loading, project, router, showError]);

  const tabs = useMemo(
    () => [
      { id: "general", label: "General" },
      { id: "members", label: "Members" },
      { id: "danger", label: "Danger zone" },
    ],
    []
  );

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-[1000px] mx-auto text-sm text-muted">Loading project…</div>
      </div>
    );
  }

  if (!project) return null;

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

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-10 bg-panel border-b border-border px-8 py-6">
        <div className="max-w-[1000px] mx-auto flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-2xl font-bold tracking-tight text-text">Project settings</h2>
            <p className="text-muted text-sm truncate">{project.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => router.push("/flows")} className="rounded-lg">
              Back
            </Button>
            <Button onClick={onSave} disabled={saving || !isAdmin} className="rounded-lg">
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </header>

      <div className="p-8">
        <div className="max-w-[1000px] mx-auto bg-panel border border-border rounded-xl shadow-soft overflow-hidden">
          <Tabs tabs={tabs} activeId={tab} onChange={(id) => setTab(id as TabId)} className="px-6" />

          {tab === "general" ? (
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-muted">Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} className="h-10 rounded-lg bg-surface2" />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-muted">Description</label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="h-10 rounded-lg bg-surface2"
                />
              </div>
              <div className="text-xs text-muted">Only admins can update project settings.</div>
            </div>
          ) : null}

          {tab === "members" ? (
            <div className="p-6 space-y-4">
              <div className="flex flex-col md:flex-row gap-2 items-stretch md:items-end">
                <div className="flex-1 space-y-2">
                  <label className="block text-sm font-medium text-muted">Add user (email or username)</label>
                  <Input
                    value={memberIdentifier}
                    onChange={(e) => setMemberIdentifier(e.target.value)}
                    className="h-10 rounded-lg bg-surface2"
                    placeholder="name@company.com"
                  />
                </div>
                <div className="w-full md:w-[200px] space-y-2">
                  <label className="block text-sm font-medium text-muted">Role</label>
                  <Select
                    value={memberRole}
                    onChange={(v) => setMemberRole(v as any)}
                    options={[
                      { value: "member", label: "Member" },
                      { value: "admin", label: "Admin" },
                    ]}
                  />
                </div>
                <Button onClick={onAddMember} disabled={!isAdmin || addingMember} className="rounded-lg">
                  {addingMember ? "Adding..." : "Add"}
                </Button>
              </div>

              <div className="border border-border rounded-xl overflow-hidden">
                <div className="grid grid-cols-12 gap-4 px-4 py-3 text-xs font-semibold text-muted bg-surface2">
                  <div className="col-span-6">User</div>
                  <div className="col-span-3">Role</div>
                  <div className="col-span-3 text-right">Actions</div>
                </div>
                {members.length === 0 ? (
                  <div className="px-4 py-6 text-sm text-muted">No members yet.</div>
                ) : (
                  members.map((m) => (
                    <div
                      key={m.user.id}
                      className="grid grid-cols-12 gap-4 px-4 py-3 border-t border-border items-center"
                    >
                      <div className="col-span-6 min-w-0">
                        <div className="text-sm font-medium text-text truncate">{m.user.name || m.user.email}</div>
                        <div className="text-xs text-muted truncate">{m.user.email}</div>
                      </div>
                      <div className="col-span-3 text-sm text-text">{m.role}</div>
                      <div className="col-span-3 flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={!isAdmin}
                          onClick={() => onRemoveMember(m.user.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : null}

          {tab === "danger" ? (
            <div className="p-6 space-y-4">
              <div className="rounded-xl border border-[color-mix(in_srgb,var(--error)_35%,var(--border))] bg-[color-mix(in_srgb,var(--error)_7%,transparent)] p-4">
                <div className="text-sm font-semibold text-red">Delete project</div>
                <div className="text-xs text-muted mt-1">
                  This deletes the project and all workflows inside it. This action cannot be undone.
                </div>
                <div className="mt-3">
                  <Button
                    variant="danger"
                    onClick={() => setConfirmDeleteOpen(true)}
                    disabled={!isAdmin}
                    className="rounded-lg"
                  >
                    Delete project
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <ConfirmDialog
        open={confirmDeleteOpen}
        title="Delete this project?"
        description="This will permanently delete the project and all workflows inside it."
        confirmLabel="Delete"
        confirmVariant="danger"
        loading={deleting}
        onConfirm={onDeleteProject}
        onClose={() => setConfirmDeleteOpen(false)}
      />
    </div>
  );
}

