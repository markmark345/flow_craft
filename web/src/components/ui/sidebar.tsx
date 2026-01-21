
"use client";

import { BrandLogo } from "./BrandLogo";
import { useMounted } from "@/hooks/use-app-store";
import { useEffect } from "react";
import { useWorkspaceStore } from "@/features/workspaces/store/use-workspace-store";
import { SidebarNav, NavItem } from "./sidebar/SidebarNav";
import { SidebarProfile } from "./sidebar/SidebarProfile";
import { SidebarWorkspaces } from "./sidebar/SidebarWorkspaces";

const navItems: NavItem[] = [
  { label: "Overview", href: "/", icon: "dashboard" },
  { label: "Flows", href: "/flows", icon: "account_tree" },
  { label: "Executions", href: "/runs", icon: "play_circle" },
  { label: "Settings", href: "/settings", icon: "settings" },
];

export function Sidebar() {
  const mounted = useMounted();

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
      // keep UI resilient
    });
  }, [loadProjects]);

  return (
    <aside className="w-[260px] shrink-0 border-r border-border bg-panel flex flex-col h-full overflow-y-auto z-20">
      <div className="flex h-full flex-col justify-between p-4">
        <div className="flex flex-col gap-6">
          <div className="px-2">
            <BrandLogo showTagline />
          </div>

          <SidebarNav items={navItems} />

          <SidebarWorkspaces
            workspaceScope={workspaceScope}
            activeProjectId={activeProjectId}
            projects={projects}
            loadingProjects={loadingProjects}
            setScope={setScope}
            setActiveProject={setActiveProject}
            loadProjects={loadProjects}
          />
        </div>

        <SidebarProfile />
      </div>
    </aside>
  );
}
