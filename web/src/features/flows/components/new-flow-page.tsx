"use client";

import { Button } from "@/shared/components/button";
import { Input } from "@/shared/components/input";
import { Select } from "@/shared/components/select";
import type { WorkspaceScope } from "@/features/workspaces/store/use-workspace-store";
import { useNewFlowForm } from "../hooks/use-new-flow-form";

export function NewFlowPage() {
  const {
    name,
    scope,
    projectId,
    loading,
    projects,
    projectOptions,
    isFormValid,
    setName,
    setScope,
    setProjectId,
    handleCreate,
  } = useNewFlowForm();

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
                disabled={!isFormValid}
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
