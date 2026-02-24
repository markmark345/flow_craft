
import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppStore } from "@/hooks/use-app-store";
import { useWorkspaceStore } from "@/features/workspaces/store/use-workspace-store";
import type { ProjectDTO } from "@/types/dto";
import { getProject } from "@/features/projects/services/projectsApi";
import { createVariable, deleteVariable, listVariables, updateVariable } from "../services/variablesApi";
import { useVariablesFilters } from "./use-variables-filters";
import { useVariablesState } from "./use-variables-state";

/**
 * Custom hook for managing Variables Page state and logic.
 * Handles variable CRUD operations and filtering.
 */
export function useVariablesPage(scope: "personal" | "project", projectId?: string) {
  const queryClient = useQueryClient();
  const showError = useAppStore((s) => s.showError);
  const showSuccess = useAppStore((s) => s.showSuccess);
  const setActiveProject = useWorkspaceStore((s) => s.setActiveProject);
  const setScope = useWorkspaceStore((s) => s.setScope);

  // Local state for project
  const [project, setProject] = useState<ProjectDTO | null>(null);

  // Sub-hooks
  const ui = useVariablesState();

  // Data query
  const { data: items = [], isLoading: loading, refetch: reload } = useQuery({
    queryKey: ["variables", scope, projectId],
    queryFn: () => listVariables(scope, projectId),
    enabled: scope !== "project" || !!projectId,
  });

  const filters = useVariablesFilters(items);

  // Computed properties
  const headerTitle = scope === "project" ? "Project Variables" : "Variables";
  const isAdmin = scope !== "project" || project?.role === "admin";

  // Load project data
  useEffect(() => {
    if (scope === "project" && projectId) {
      setActiveProject(projectId);
      void (async () => {
        try {
          const p = await getProject(projectId);
          setProject(p);
        } catch {
          setProject(null);
        }
      })();
    } else {
      setScope("personal");
    }
  }, [projectId, scope, setActiveProject, setScope]);

  const invalidateVariables = () => queryClient.invalidateQueries({ queryKey: ["variables"] });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (params: Parameters<typeof createVariable>[0]) => createVariable(params),
    onSuccess: () => { invalidateVariables(); showSuccess("Created", "Variable created."); },
    onError: (err: unknown) => showError("Save failed", err instanceof Error ? err.message : "Unable to save variable"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, key, value }: { id: string; key: string; value: string }) => updateVariable(id, { key, value }),
    onSuccess: () => { invalidateVariables(); showSuccess("Updated", "Variable updated."); },
    onError: (err: unknown) => showError("Save failed", err instanceof Error ? err.message : "Unable to save variable"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteVariable(id),
    onSuccess: () => { invalidateVariables(); showSuccess("Deleted", "Variable removed."); },
    onError: (err: unknown) => showError("Delete failed", err instanceof Error ? err.message : "Unable to delete variable"),
  });

  // Actions
  const onSave = async () => {
    const key = ui.draftKey.trim();
    if (!key) {
      showError("Save failed", "Key is required.");
      return;
    }
    if (!isAdmin) {
      showError("Forbidden", "Only project admins can manage variables.");
      return;
    }
    ui.setSaving(true);
    try {
      if (ui.editing) {
        await updateMutation.mutateAsync({ id: ui.editing.id, key, value: ui.draftValue });
      } else {
        await createMutation.mutateAsync({ scope, projectId, key, value: ui.draftValue });
      }
      ui.setModalOpen(false);
    } finally {
      ui.setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!ui.selectedId) return;
    ui.setDeleting(true);
    try {
      await deleteMutation.mutateAsync(ui.selectedId);
    } finally {
      ui.setDeleting(false);
      ui.setConfirmDeleteOpen(false);
      ui.setSelectedId(null);
    }
  };

  // Project navigation items
  const projectNavItems = useMemo(() => {
    if (scope !== "project" || !projectId) return [];
    return [
      { id: "workflows", label: "Workflows", href: "/flows", onClick: () => setActiveProject(projectId) },
      { id: "credentials", label: "Credentials", href: `/projects/${projectId}/credentials`, onClick: () => setActiveProject(projectId) },
      { id: "executions", label: "Executions", href: "/runs", onClick: () => setActiveProject(projectId) },
      { id: "variables", label: "Variables", href: `/projects/${projectId}/variables`, active: true },
      { id: "settings", label: "Project Settings", href: `/projects/${projectId}/settings` },
    ];
  }, [projectId, scope, setActiveProject]);

  return {
    // Data
    items,
    project,
    loading,
    isAdmin,
    headerTitle,
    projectNavItems,

    // Spread sub-hooks
    ...filters,
    ...ui,

    // Actions
    reload,
    onSave,
    onDelete,
  };
}
