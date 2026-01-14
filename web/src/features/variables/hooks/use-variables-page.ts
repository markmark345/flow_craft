import { useCallback, useEffect, useMemo, useState } from "react";
import { useAppStore } from "@/shared/hooks/use-app-store";
import { useWorkspaceStore } from "@/features/workspaces/store/use-workspace-store";
import type { ProjectDTO, VariableDTO } from "@/shared/types/dto";
import { getProject } from "@/features/projects/services/projectsApi";
import { createVariable, deleteVariable, listVariables, updateVariable } from "../services/variablesApi";

type SortKey = "updated" | "created" | "key";

export interface UseVariablesPageReturn {
  // Data
  items: VariableDTO[];
  filtered: VariableDTO[];
  project: ProjectDTO | null;

  // UI state
  loading: boolean;
  isAdmin: boolean;
  headerTitle: string;

  // Modal state
  modalOpen: boolean;
  editing: VariableDTO | null;
  draftKey: string;
  draftValue: string;
  saving: boolean;

  // Delete confirmation
  confirmDeleteOpen: boolean;
  selectedId: string | null;
  deleting: boolean;

  // Filters
  query: string;
  sortKey: SortKey;

  // Workspace
  projectNavItems: Array<{
    id: string;
    label: string;
    href: string;
    active?: boolean;
    onClick?: () => void;
  }>;

  // Actions
  setQuery: (query: string) => void;
  setSortKey: (key: SortKey) => void;
  setModalOpen: (open: boolean) => void;
  setDraftKey: (key: string) => void;
  setDraftValue: (value: string) => void;
  setConfirmDeleteOpen: (open: boolean) => void;
  setSelectedId: (id: string | null) => void;
  reload: () => Promise<void>;
  openCreate: () => void;
  openEdit: (item: VariableDTO) => void;
  onSave: () => Promise<void>;
  onDelete: () => Promise<void>;
}

/**
 * Custom hook for managing Variables Page state and logic.
 * Handles variable CRUD operations and filtering.
 */
export function useVariablesPage(scope: "personal" | "project", projectId?: string): UseVariablesPageReturn {
  const showError = useAppStore((s) => s.showError);
  const showSuccess = useAppStore((s) => s.showSuccess);
  const setActiveProject = useWorkspaceStore((s) => s.setActiveProject);
  const setScope = useWorkspaceStore((s) => s.setScope);

  // Local state - data
  const [items, setItems] = useState<VariableDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<ProjectDTO | null>(null);
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("updated");

  // Local state - modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<VariableDTO | null>(null);
  const [draftKey, setDraftKey] = useState("");
  const [draftValue, setDraftValue] = useState("");
  const [saving, setSaving] = useState(false);

  // Local state - delete confirmation
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

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
    } catch (err: any) {
      showError("Load failed", err?.message || "Unable to load variables");
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

  // Filtered and sorted items
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? items.filter((item) => item.key.toLowerCase().includes(q) || item.value.toLowerCase().includes(q))
      : items;
    const sorted = [...list];
    sorted.sort((a, b) => {
      if (sortKey === "key") return a.key.localeCompare(b.key);
      const aTime = sortKey === "created" ? a.createdAt : a.updatedAt;
      const bTime = sortKey === "created" ? b.createdAt : b.updatedAt;
      return (bTime || "").localeCompare(aTime || "");
    });
    return sorted;
  }, [items, query, sortKey]);

  // Modal actions
  const openCreate = () => {
    setEditing(null);
    setDraftKey("");
    setDraftValue("");
    setModalOpen(true);
  };

  const openEdit = (item: VariableDTO) => {
    setEditing(item);
    setDraftKey(item.key);
    setDraftValue(item.value);
    setModalOpen(true);
  };

  const onSave = async () => {
    const key = draftKey.trim();
    if (!key) {
      showError("Save failed", "Key is required.");
      return;
    }
    if (!isAdmin) {
      showError("Forbidden", "Only project admins can manage variables.");
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        const updated = await updateVariable(editing.id, { key, value: draftValue });
        setItems((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        showSuccess("Updated", "Variable updated.");
      } else {
        const created = await createVariable({ scope, projectId, key, value: draftValue });
        setItems((prev) => [created, ...prev]);
        showSuccess("Created", "Variable created.");
      }
      setModalOpen(false);
    } catch (err: any) {
      showError("Save failed", err?.message || "Unable to save variable");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!selectedId) return;
    setDeleting(true);
    try {
      await deleteVariable(selectedId);
      setItems((prev) => prev.filter((item) => item.id !== selectedId));
      showSuccess("Deleted", "Variable removed.");
    } catch (err: any) {
      showError("Delete failed", err?.message || "Unable to delete variable");
    } finally {
      setDeleting(false);
      setConfirmDeleteOpen(false);
      setSelectedId(null);
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
    filtered,
    project,

    // UI state
    loading,
    isAdmin,
    headerTitle,

    // Modal state
    modalOpen,
    editing,
    draftKey,
    draftValue,
    saving,

    // Delete confirmation
    confirmDeleteOpen,
    selectedId,
    deleting,

    // Filters
    query,
    sortKey,

    // Workspace
    projectNavItems,

    // Actions
    setQuery,
    setSortKey,
    setModalOpen,
    setDraftKey,
    setDraftValue,
    setConfirmDeleteOpen,
    setSelectedId,
    reload,
    openCreate,
    openEdit,
    onSave,
    onDelete,
  };
}
