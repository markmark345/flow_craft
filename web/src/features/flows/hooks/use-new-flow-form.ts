import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCreateFlow } from "./use-create-flow";
import { useAppStore, useMounted } from "@/hooks/use-app-store";
import { useWorkspaceStore, type WorkspaceScope } from "@/features/workspaces/store/use-workspace-store";

export interface NewFlowFormState {
  name: string;
  scope: WorkspaceScope;
  projectId: string | null;
  loading: boolean;
  projects: ReturnType<typeof useWorkspaceStore.getState>["projects"];
  projectOptions: Array<{ value: string; label: string; description: string }>;
  isFormValid: boolean;
}

export interface NewFlowFormActions {
  setName: (name: string) => void;
  setScope: (scope: WorkspaceScope) => void;
  setProjectId: (id: string | null) => void;
  handleCreate: () => Promise<void>;
}

export type UseNewFlowFormReturn = NewFlowFormState & NewFlowFormActions;

/**
 * Custom hook for managing new flow creation form state and logic.
 * Handles form validation, project selection, and flow creation workflow.
 */
export function useNewFlowForm(): UseNewFlowFormReturn {
  const [name, setName] = useState("");
  const [scope, setScope] = useState<WorkspaceScope>("personal");
  const [projectId, setProjectId] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const mounted = useMounted();
  const { createFlow, loading } = useCreateFlow();
  const showSuccess = useAppStore((s) => s.showSuccess);
  const showError = useAppStore((s) => s.showError);
  const projects = useWorkspaceStore((s) => s.projects);
  const loadProjects = useWorkspaceStore((s) => s.loadProjects);

  // Load projects on mount
  useEffect(() => {
    loadProjects().catch(() => {});
  }, [loadProjects]);

  // Sync scope and projectId from URL params
  useEffect(() => {
    if (!mounted) return;
    const paramScope = (searchParams.get("scope") || "").toLowerCase();
    const paramProjectId = searchParams.get("projectId");
    const nextScope: WorkspaceScope = paramScope === "project" ? "project" : "personal";
    setScope(nextScope);
    setProjectId(paramProjectId || null);
  }, [mounted, searchParams]);

  // Auto-select project if only one exists
  useEffect(() => {
    if (scope !== "project") return;
    if (!projectId) {
      if (projects.length === 1) setProjectId(projects[0].id);
      return;
    }
    // Reset projectId if it's no longer valid
    if (!projects.some((p) => p.id === projectId)) setProjectId(null);
  }, [projectId, projects, scope]);

  // Transform projects to select options
  const projectOptions = useMemo(
    () =>
      projects.map((p) => ({
        value: p.id,
        label: p.name,
        description: p.role === "admin" ? "Admin" : "Member",
      })),
    [projects]
  );

  // Form validation
  const isFormValid = useMemo(() => {
    if (!name.trim()) return false;
    if (loading) return false;
    if (scope === "project" && !projectId) return false;
    return true;
  }, [name, loading, scope, projectId]);

  // Handle flow creation
  const handleCreate = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;

    try {
      if (scope === "project" && !projectId) {
        showError("Create failed", "Select a project first.");
        return;
      }

      const flow = await createFlow(trimmed, { scope, projectId });

      // Update workspace state
      if (scope === "project" && projectId) {
        useWorkspaceStore.getState().setActiveProject(projectId);
      } else {
        useWorkspaceStore.getState().setScope("personal");
      }

      showSuccess("Flow created", flow.name);
      router.push(`/flows/${flow.id}/builder`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unable to create flow";
      showError("Create failed", errorMessage);
    }
  };

  return {
    // State
    name,
    scope,
    projectId,
    loading,
    projects,
    projectOptions,
    isFormValid,
    // Actions
    setName,
    setScope,
    setProjectId,
    handleCreate,
  };
}
