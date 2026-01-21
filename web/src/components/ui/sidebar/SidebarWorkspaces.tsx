
"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/icon";
import { ProjectDTO } from "@/types/dto";
import { CreateProjectModal } from "@/features/projects/components/create-project-modal";
import { useState } from "react";
import { createProject } from "@/features/projects/services/projectsApi";
import { useAppStore } from "@/hooks/use-app-store";

interface SidebarWorkspacesProps {
  workspaceScope: "personal" | "project";
  activeProjectId: string | null;
  projects: ProjectDTO[];
  loadingProjects: boolean;
  setScope: (scope: "personal" | "project") => void;
  setActiveProject: (id: string) => void;
  loadProjects: () => Promise<void>;
}

export function SidebarWorkspaces({
  workspaceScope,
  activeProjectId,
  projects,
  loadingProjects,
  setScope,
  setActiveProject,
  loadProjects,
}: SidebarWorkspacesProps) {
  const router = useRouter();
  const showSuccess = useAppStore((s) => s.showSuccess);
  const showError = useAppStore((s) => s.showError);

  const [projectsExpanded, setProjectsExpanded] = useState(true);
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [creatingProject, setCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");

  const handleCreateProject = async () => {
    const name = newProjectName.trim();
    if (!name) {
      showError("Create failed", "Project name is required.");
      return;
    }
    setCreatingProject(true);
    try {
      const created = await createProject({ name, description: newProjectDescription.trim() || undefined });
      await loadProjects();
      setActiveProject(created.id);
      showSuccess("Project created", created.name);
      setCreateProjectOpen(false);
      router.push("/flows");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to create project";
      showError("Create failed", message);
    } finally {
      setCreatingProject(false);
    }
  };

  return (
    <>
      <div className="pt-4 border-t border-border">
        <div className="flex items-center justify-between px-3 mb-2">
          <div className="text-xs font-semibold text-muted uppercase tracking-wide">Workspaces</div>
        </div>

        <button
          type="button"
          onClick={() => {
            setScope("personal");
            router.push("/flows");
          }}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
            workspaceScope === "personal"
              ? "text-accent"
              : "text-muted hover:bg-surface2 hover:text-text"
          )}
          style={
            workspaceScope === "personal"
              ? { background: "color-mix(in srgb, var(--accent) var(--accent-tint, 10%), transparent)" }
              : undefined
          }
        >
          <Icon name="person" className="text-[18px]" />
          <div className="min-w-0 flex-1 text-left">
            <div className={cn("text-sm", workspaceScope === "personal" ? "font-bold" : "font-medium")}>
              Personal
            </div>
            <div className="text-xs text-muted">Workflows owned by you</div>
          </div>
        </button>

        <div className="mt-3">
          <div className="flex items-center justify-between px-3 mb-1">
            <button
              type="button"
              className="inline-flex items-center gap-2 text-xs font-semibold text-muted uppercase tracking-wide hover:text-text transition-colors"
              onClick={() => setProjectsExpanded((v) => !v)}
            >
              <Icon
                name="expand_more"
                className={cn("text-[16px] transition-transform", projectsExpanded ? "" : "-rotate-90")}
              />
              Projects
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center size-8 rounded-lg border border-border bg-surface hover:bg-surface2 text-muted hover:text-text transition-colors"
              title="Create project"
              onClick={() => {
                setNewProjectName("");
                setNewProjectDescription("");
                setCreateProjectOpen(true);
              }}
            >
              <Icon name="add" className="text-[16px]" />
            </button>
          </div>

          {projectsExpanded ? (
            <div className="flex flex-col gap-1">
              {loadingProjects ? (
                <div className="px-3 py-2 text-xs text-muted">Loading projects…</div>
              ) : projects.length === 0 ? (
                <div className="px-3 py-2 text-xs text-muted">No projects yet.</div>
              ) : (
                projects.map((p) => {
                  const isActive = workspaceScope === "project" && activeProjectId === p.id;
                  return (
                    <div
                      key={p.id}
                      className={cn(
                        "w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors",
                        isActive ? "text-accent" : "text-muted hover:bg-surface2 hover:text-text"
                      )}
                      style={
                        isActive
                          ? { background: "color-mix(in srgb, var(--accent) var(--accent-tint, 10%), transparent)" }
                          : undefined
                      }
                    >
                      <button
                        type="button"
                        className="flex items-center gap-3 flex-1 min-w-0 text-left"
                        onClick={() => {
                          setActiveProject(p.id);
                          router.push("/flows");
                        }}
                      >
                        <span className="size-6 rounded-md bg-surface2 border border-border flex items-center justify-center text-[11px] font-bold text-muted">
                          {(p.name || "P").slice(0, 2).toUpperCase()}
                        </span>
                        <span className={cn("text-sm truncate", isActive ? "font-bold" : "font-medium")}>
                          {p.name}
                        </span>
                      </button>

                      {p.role === "admin" ? (
                        <button
                          type="button"
                          className="inline-flex items-center justify-center size-8 rounded-lg border border-border bg-surface hover:bg-surface2 text-muted hover:text-text transition-colors"
                          title="Project settings"
                          onClick={() => router.push(`/projects/${p.id}/settings`)}
                        >
                          <Icon name="settings" className="text-[16px]" />
                        </button>
                      ) : null}
                    </div>
                  );
                })
              )}
            </div>
          ) : null}
        </div>
      </div>

      <CreateProjectModal
        open={createProjectOpen}
        name={newProjectName}
        description={newProjectDescription}
        creating={creatingProject}
        onNameChange={setNewProjectName}
        onDescriptionChange={setNewProjectDescription}
        onClose={() => setCreateProjectOpen(false)}
        onCreate={handleCreateProject}
      />
    </>
  );
}
