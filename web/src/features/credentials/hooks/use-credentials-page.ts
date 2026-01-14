import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppStore } from "@/shared/hooks/use-app-store";
import { useWorkspaceStore } from "@/features/workspaces/store/use-workspace-store";
import type { CredentialDTO, ProjectDTO } from "@/shared/types/dto";
import { deleteCredential, listCredentials, startCredentialOAuth } from "../services/credentialsApi";
import { getProject } from "@/features/projects/services/projectsApi";

type SortKey = "updated" | "created" | "name";

export interface UseCredentialsPageReturn {
  // Data
  items: CredentialDTO[];
  filtered: CredentialDTO[];
  project: ProjectDTO | null;

  // UI state
  loading: boolean;
  menuOpen: boolean;
  menuRef: React.RefObject<HTMLDivElement>;
  confirmDeleteOpen: boolean;
  selectedId: string | null;
  deleting: boolean;
  isAdmin: boolean;
  headerTitle: string;

  // Filters
  query: string;
  sortKey: SortKey;

  // Workspace
  returnPath: string;
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
  setMenuOpen: (open: boolean) => void;
  setConfirmDeleteOpen: (open: boolean) => void;
  setSelectedId: (id: string | null) => void;
  reload: () => Promise<void>;
  onConnect: (provider: "google" | "github") => Promise<void>;
  onDelete: () => Promise<void>;
}

/**
 * Custom hook for managing Credentials Page state and logic.
 * Handles credential listing, OAuth flow, and deletion.
 */
export function useCredentialsPage(scope: "personal" | "project", projectId?: string): UseCredentialsPageReturn {
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
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("updated");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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
    } catch (err: any) {
      showError("Load failed", err?.message || "Unable to load credentials");
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

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const onMouseDown = (event: MouseEvent) => {
      const root = menuRef.current;
      if (!root) return;
      if (event.target instanceof Node && !root.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  // Actions
  const onConnect = async (provider: "google" | "github") => {
    try {
      const res = await startCredentialOAuth(provider, {
        scope,
        projectId,
        returnTo: returnPath,
      });
      window.location.href = res.url;
    } catch (err: any) {
      showError("Connection failed", err?.message || "Unable to start OAuth flow");
    }
  };

  const onDelete = async () => {
    if (!selectedId) return;
    setDeleting(true);
    try {
      await deleteCredential(selectedId);
      showSuccess("Credential removed");
      setItems((prev) => prev.filter((item) => item.id !== selectedId));
    } catch (err: any) {
      showError("Delete failed", err?.message || "Unable to delete credential");
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
      { id: "credentials", label: "Credentials", href: `/projects/${projectId}/credentials`, active: true },
      { id: "executions", label: "Executions", href: "/runs", onClick: () => setActiveProject(projectId) },
      { id: "variables", label: "Variables", href: `/projects/${projectId}/variables` },
      { id: "settings", label: "Project Settings", href: `/projects/${projectId}/settings` },
    ];
  }, [projectId, scope, setActiveProject]);

  // Filtered and sorted items
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? items.filter((item) => {
          const hay = `${item.name} ${item.provider} ${item.accountEmail || ""}`.toLowerCase();
          return hay.includes(q);
        })
      : items;
    const sorted = [...list];
    sorted.sort((a, b) => {
      if (sortKey === "name") return (a.name || "").localeCompare(b.name || "");
      const aTime = sortKey === "created" ? a.createdAt : a.updatedAt;
      const bTime = sortKey === "created" ? b.createdAt : b.updatedAt;
      return (bTime || "").localeCompare(aTime || "");
    });
    return sorted;
  }, [items, query, sortKey]);

  return {
    // Data
    items,
    filtered,
    project,

    // UI state
    loading,
    menuOpen,
    menuRef,
    confirmDeleteOpen,
    selectedId,
    deleting,
    isAdmin,
    headerTitle,

    // Filters
    query,
    sortKey,

    // Workspace
    returnPath,
    projectNavItems,

    // Actions
    setQuery,
    setSortKey,
    setMenuOpen,
    setConfirmDeleteOpen,
    setSelectedId,
    reload,
    onConnect,
    onDelete,
  };
}
