
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppStore } from "@/hooks/use-app-store";
import { useWorkspaceStore } from "@/features/workspaces/store/use-workspace-store";
import type { CredentialDTO, ProjectDTO } from "@/types/dto";
import { deleteCredential, listCredentials, startCredentialOAuth } from "../services/credentialsApi";
import { getProject } from "@/features/projects/services/projectsApi";
import { useCredentialsFilters } from "./use-credentials-filters";
import { useCredentialsState } from "./use-credentials-state";

/**
 * Custom hook for managing Credentials Page state and logic.
 * Handles credential listing, OAuth flow, and deletion.
 */
export function useCredentialsPage(scope: "personal" | "project", projectId?: string) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const showError = useAppStore((s) => s.showError);
  const showSuccess = useAppStore((s) => s.showSuccess);
  const setActiveProject = useWorkspaceStore((s) => s.setActiveProject);
  const setScope = useWorkspaceStore((s) => s.setScope);

  // Local state
  const [items, setItems] = useState<CredentialDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<ProjectDTO | null>(null);

  // Sub-hooks
  const filters = useCredentialsFilters(items);
  const ui = useCredentialsState();

  // Computed properties
  const headerTitle = scope === "project" ? "Project Credentials" : "Credentials";
  const isAdmin = scope !== "project" || project?.role === "admin";
  const connected = searchParams.get("connected");
  const connectError = searchParams.get("error");

  const returnPath = useMemo(() => {
    if (typeof window === "undefined") return "/";
    return window.location.pathname;
  }, []);

  // Data loading
  const reload = useCallback(async () => {
    if (scope === "project" && !projectId) return;
    setLoading(true);
    try {
      const data = await listCredentials(scope, projectId);
      setItems(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unable to load credentials";
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

  // Handle OAuth callback
  useEffect(() => {
    if (!connected && !connectError) return;
    if (connectError) {
      showError("Connection failed", connectError);
    } else if (connected) {
      showSuccess("Connected", `${connected} credential added.`);
    }
    reload();
    router.replace(returnPath as any);
  }, [connected, connectError, reload, returnPath, router, showError, showSuccess]);

  // Actions
  const onConnect = async (provider: "google" | "github") => {
    try {
      const res = await startCredentialOAuth(provider, {
        scope,
        projectId,
        returnTo: returnPath,
      });
      window.location.href = res.url;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unable to start OAuth flow";
      showError("Connection failed", message);
    }
  };

  const onDelete = async () => {
    if (!ui.selectedId) return;
    ui.setDeleting(true);
    try {
      await deleteCredential(ui.selectedId);
      showSuccess("Credential removed");
      setItems((prev) => prev.filter((item) => item.id !== ui.selectedId));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unable to delete credential";
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
      { id: "credentials", label: "Credentials", href: `/projects/${projectId}/credentials`, active: true },
      { id: "executions", label: "Executions", href: "/runs", onClick: () => setActiveProject(projectId) },
      { id: "variables", label: "Variables", href: `/projects/${projectId}/variables` },
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
    onConnect,
    onDelete,
    
    // Explicit return for returnPath if needed in UI, though less common
    returnPath,
  };
}
