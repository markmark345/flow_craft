
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAppStore } from "@/hooks/use-app-store";
import { useWorkspaceStore } from "@/features/workspaces/store/use-workspace-store";
import type { ProjectDTO, VariableDTO } from "@/types/dto";
import { getProject } from "@/features/projects/services/projectsApi";
import { createVariable, deleteVariable, listVariables, updateVariable } from "../services/variablesApi";
import { useVariablesFilters } from "./use-variables-filters";
import { useVariablesState } from "./use-variables-state";

/**
 * Custom hook for managing Variables Page state and logic.
 * Handles variable CRUD operations and filtering.
 */
export function useVariablesPage(scope: "personal" | "project", projectId?: string) {
  const showError = useAppStore((s) => s.showError);
  const showSuccess = useAppStore((s) => s.showSuccess);
  const setActiveProject = useWorkspaceStore((s) => s.setActiveProject);
  const setScope = useWorkspaceStore((s) => s.setScope);

  // Local state - data
  const [items, setItems] = useState<VariableDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<ProjectDTO | null>(null);

  // Sub-hooks
  const filters = useVariablesFilters(items);
  const ui = useVariablesState();

  // Computed properties
  const headerTitle = scope === "project" ? "Project Variables" : "Variables";
  const isAdmin = scope !== "project" || project?.role === "admin";

  // Data loading
  const reload = useCallback(async () => {
    if (scope === "project" && !projectId) return;
    setLoading(true);
    try {
      const data = await listVariables(scope, projectId);
      setItems(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unable to load variables";
      showError("Load failed", message);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [projectId, scope, showError]);

  useEffect(() => {
    reload();
  }, [reload]);

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
        const updated = await updateVariable(ui.editing.id, { key, value: ui.draftValue });
        setItems((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        showSuccess("Updated", "Variable updated.");
      } else {
        const created = await createVariable({ scope, projectId, key, value: ui.draftValue });
        setItems((prev) => [created, ...prev]);
        showSuccess("Created", "Variable created.");
      }
      ui.setModalOpen(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unable to save variable";
      showError("Save failed", message);
    } finally {
      ui.setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!ui.selectedId) return;
    ui.setDeleting(true);
    try {
      await deleteVariable(ui.selectedId);
      setItems((prev) => prev.filter((item) => item.id !== ui.selectedId));
      showSuccess("Deleted", "Variable removed.");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unable to delete variable";
      showError("Delete failed", message);
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
