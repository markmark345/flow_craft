
import { useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppStore } from "@/hooks/use-app-store";
import { useWorkspaceStore } from "@/features/workspaces/store/use-workspace-store";
import type { ProjectDTO } from "@/types/dto";
import { deleteCredential, listCredentials, startCredentialOAuth } from "../services/credentialsApi";
import { getProject } from "@/features/projects/services/projectsApi";
import { useCredentialsFilters } from "./use-credentials-filters";
import { useCredentialsState } from "./use-credentials-state";
import { useState } from "react";

/**
 * Custom hook for managing Credentials Page state and logic.
 * Handles credential listing, OAuth flow, and deletion.
 */
export function useCredentialsPage(scope: "personal" | "project", projectId?: string) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const showError = useAppStore((s) => s.showError);
  const showSuccess = useAppStore((s) => s.showSuccess);
  const setActiveProject = useWorkspaceStore((s) => s.setActiveProject);
  const setScope = useWorkspaceStore((s) => s.setScope);

  // Local state for project (not part of credentials query)
  const [project, setProject] = useState<ProjectDTO | null>(null);

  // Sub-hooks
  const ui = useCredentialsState();

  // Data query
  const { data: items = [], isLoading: loading, refetch: reload } = useQuery({
    queryKey: ["credentials", scope, projectId],
    queryFn: () => listCredentials(scope, projectId),
    enabled: scope !== "project" || !!projectId,
  });

  const filters = useCredentialsFilters(items);

  // Computed properties
  const headerTitle = scope === "project" ? "Project Credentials" : "Credentials";
  const isAdmin = scope !== "project" || project?.role === "admin";
  const connected = searchParams.get("connected");
  const connectError = searchParams.get("error");

  const returnPath = useMemo(() => {
    if (typeof window === "undefined") return "/";
    return window.location.pathname;
  }, []);

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
    queryClient.invalidateQueries({ queryKey: ["credentials", scope, projectId] });
    router.replace(returnPath as any);
  }, [connected, connectError, queryClient, returnPath, router, scope, projectId, showError, showSuccess]);

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCredential(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["credentials"] }),
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : "Unable to delete credential";
      showError("Delete failed", message);
    },
  });

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
      await deleteMutation.mutateAsync(ui.selectedId);
      showSuccess("Credential removed");
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

    returnPath,
  };
}
