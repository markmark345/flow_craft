"use client";

import { Button } from "@/shared/components/button";
import { Input } from "@/shared/components/input";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCreateFlow } from "../hooks/use-create-flow";
import { useAppStore, useMounted } from "@/shared/hooks/use-app-store";
import { Select } from "@/shared/components/select";
import { useWorkspaceStore, type WorkspaceScope } from "@/features/workspaces/store/use-workspace-store";

export function NewFlowPage() {
  const [name, setName] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const mounted = useMounted();
  const { createFlow, loading } = useCreateFlow();
  const showSuccess = useAppStore((s) => s.showSuccess);
  const showError = useAppStore((s) => s.showError);
  const projects = useWorkspaceStore((s) => s.projects);
  const loadProjects = useWorkspaceStore((s) => s.loadProjects);

  const [scope, setScope] = useState<WorkspaceScope>("personal");
  const [projectId, setProjectId] = useState<string | null>(null);

  useEffect(() => {
    loadProjects().catch(() => {});
  }, [loadProjects]);

  useEffect(() => {
    if (!mounted) return;
    const paramScope = (searchParams.get("scope") || "").toLowerCase();
    const paramProjectId = searchParams.get("projectId");
    const nextScope: WorkspaceScope = paramScope === "project" ? "project" : "personal";
    setScope(nextScope);
    setProjectId(paramProjectId || null);
  }, [mounted, searchParams]);

  useEffect(() => {
    if (scope !== "project") return;
    if (!projectId) {
      if (projects.length === 1) setProjectId(projects[0].id);
      return;
    }
    if (!projects.some((p) => p.id === projectId)) setProjectId(null);
  }, [projectId, projects, scope]);

  const projectOptions = useMemo(
    () =>
      projects.map((p) => ({
        value: p.id,
        label: p.name,
        description: p.role === "admin" ? "Admin" : "Member",
      })),
    [projects]
  );

  const handleCreate = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    try {
      if (scope === "project" && !projectId) {
        showError("Create failed", "Select a project first.");
        return;
      }
      const flow = await createFlow(trimmed, { scope, projectId });
      if (scope === "project" && projectId) {
        useWorkspaceStore.getState().setActiveProject(projectId);
      } else {
        useWorkspaceStore.getState().setScope("personal");
      }
      showSuccess("Flow created", flow.name);
      router.push(`/flows/${flow.id}/builder`);
    } catch (err: any) {
      showError("Create failed", err?.message || "Unable to create flow");
    }
  };

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-10 bg-panel border-b border-border px-8 py-6">
        <div className="max-w-[900px] mx-auto flex flex-col gap-1">
          <h2 className="text-2xl font-bold tracking-tight text-text">Create workflow</h2>
          <p className="text-muted text-sm">Choose where this workflow lives.</p>
        </div>
      </header>

      <div className="p-8">
        <div className="max-w-[900px] mx-auto">
          <div className="bg-panel border border-border rounded-xl shadow-soft p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-muted">Scope</label>
                <Select
                  value={scope}
                  onChange={(v) => setScope(v as WorkspaceScope)}
                  options={[
                    {
                      value: "personal",
                      label: "Personal",
                      description: "Only you can see this workflow.",
                    },
                    {
                      value: "project",
                      label: "Project",
                      description: projects.length ? "Shared with project members." : "Create a project first.",
                      disabled: projects.length === 0,
                    },
                  ]}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-muted">Project</label>
                <Select
                  value={projectId || ""}
                  onChange={(v) => setProjectId(v || null)}
                  options={[{ value: "", label: "Select a project…", disabled: true }, ...projectOptions]}
                  searchable
                  searchPlaceholder="Search projects…"
                  className={scope === "project" ? "" : "opacity-60 pointer-events-none"}
                />
              </div>
            </div>
            <label className="block text-sm font-medium text-muted">Flow name</label>
            <Input
              placeholder="My flow"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 rounded-lg bg-surface2"
            />
            <div className="flex justify-end">
              <Button
                onClick={handleCreate}
                disabled={!name.trim() || loading || (scope === "project" && !projectId)}
                className="rounded-lg"
              >
                {loading ? "Creating..." : "Create"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
