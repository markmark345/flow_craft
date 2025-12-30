"use client";

import Link from "next/link";
import { cn } from "@/shared/lib/cn";
import { BrandLogo } from "./BrandLogo";
import { usePathname, useRouter } from "next/navigation";
import { Icon } from "@/shared/components/icon";
import { useAppStore, useMounted } from "@/shared/hooks/use-app-store";
import { useAuthStore } from "@/features/auth/store/use-auth-store";
import { useLogout } from "@/features/auth/hooks/use-logout";
import { useEffect, useState } from "react";
import { useWorkspaceStore } from "@/features/workspaces/store/use-workspace-store";
import { createProject } from "@/features/projects/services/projectsApi";
import { CreateProjectModal } from "@/features/projects/components/create-project-modal";

const nav = [
  { label: "Overview", href: "/", icon: "dashboard" },
  { label: "Flows", href: "/flows", icon: "account_tree" },
  { label: "Executions", href: "/runs", icon: "play_circle" },
  { label: "Settings", href: "/settings", icon: "settings" },
] as const;

export function Sidebar() {
  const active = usePathname();
  const router = useRouter();
  const mounted = useMounted();
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const isDark = mounted ? theme === "dark" : false;
  const authUser = useAuthStore((s) => s.user);
  const user = mounted ? authUser : undefined;
  const { signOut, loading: signingOut } = useLogout();
  const showSuccess = useAppStore((s) => s.showSuccess);
  const showError = useAppStore((s) => s.showError);

  const workspaceScopeRaw = useWorkspaceStore((s) => s.activeScope);
  const activeProjectIdRaw = useWorkspaceStore((s) => s.activeProjectId);
  const projects = useWorkspaceStore((s) => s.projects);
  const loadingProjects = useWorkspaceStore((s) => s.loadingProjects);
  const setScope = useWorkspaceStore((s) => s.setScope);
  const setActiveProject = useWorkspaceStore((s) => s.setActiveProject);
  const loadProjects = useWorkspaceStore((s) => s.loadProjects);

  const workspaceScope = mounted ? workspaceScopeRaw : "personal";
  const activeProjectId = mounted ? activeProjectIdRaw : null;

  useEffect(() => {
    loadProjects().catch(() => {
      // keep UI resilient; failures will be visible when trying to create/switch
    });
  }, [loadProjects]);

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
    } catch (err: any) {
      showError("Create failed", err?.message || "Unable to create project");
    } finally {
      setCreatingProject(false);
    }
  };

  const initials = (() => {
    const name = (user?.name || "").trim();
    if (name) {
      const parts = name.split(/\s+/).filter(Boolean);
      return ((parts[0]?.[0] || "") + (parts[1]?.[0] || parts[0]?.[1] || "")).toUpperCase() || "U";
    }
    const email = (user?.email || "").trim();
    if (email) return email.slice(0, 2).toUpperCase();
    return "U";
  })();
  return (
    <aside className="w-[260px] shrink-0 border-r border-border bg-panel flex flex-col h-full overflow-y-auto z-20">
      <div className="flex h-full flex-col justify-between p-4">
        <div className="flex flex-col gap-6">
          <div className="px-2">
            <BrandLogo showTagline />
          </div>

          <nav className="flex flex-col gap-1">
            {nav.map((item) => {
              const isActive = item.href === "/" ? active === "/" : active.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group",
                    isActive ? "text-accent" : "text-muted hover:bg-surface2 hover:text-text"
                  )}
                  style={
                    isActive
                      ? { background: "color-mix(in srgb, var(--accent) var(--accent-tint, 10%), transparent)" }
                      : undefined
                  }
                >
                  <span
                    className={cn("transition-colors", isActive ? "text-accent" : "text-muted group-hover:text-accent")}
                  >
                    <Icon name={item.icon} className="text-[20px]" />
                  </span>
                  <span className={cn("text-sm", isActive ? "font-bold" : "font-medium")}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

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
                                onClick={() => router.push(`/projects/${p.id}/settings` as any)}
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
        </div>

        <div className="flex flex-col gap-2 border-t border-border pt-4">
          <Link
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted hover:bg-surface2 hover:text-text transition-colors"
            href="/docs"
          >
            <Icon name="help" className="text-[20px]" />
            <span className="text-sm font-medium">Documentation</span>
          </Link>

          <button
            type="button"
            onClick={toggleTheme}
            className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-muted hover:bg-surface2 hover:text-text transition-colors"
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            <span className="flex items-center gap-3">
              <Icon name={isDark ? "dark_mode" : "light_mode"} className="text-[20px]" />
              <span className="text-sm font-medium">Theme</span>
            </span>
            <span className="text-xs font-semibold px-2 py-1 rounded-md bg-surface2 border border-border text-muted">
              {isDark ? "Dark" : "Light"}
            </span>
          </button>

          <div className="flex items-center gap-3 px-3 py-2 mt-2">
            <div className="size-8 rounded-full bg-surface2 border border-border flex items-center justify-center text-xs font-bold text-muted">
              {initials}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium truncate">{user?.name || user?.email || "User"}</span>
              <span className="text-xs text-muted truncate">{user?.email || ""}</span>
            </div>
            <button
              type="button"
              className="ml-auto inline-flex items-center justify-center size-9 rounded-lg border border-border bg-surface hover:bg-surface2 text-muted hover:text-text transition-colors disabled:opacity-60"
              title="Log out"
              onClick={async () => {
                await signOut();
                router.replace("/login");
              }}
              disabled={signingOut}
            >
              <Icon name="arrow_back" className="text-[18px] rotate-180" />
            </button>
          </div>
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
    </aside>
  );
}
