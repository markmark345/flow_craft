"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/shared/components/button";
import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import { Icon } from "@/shared/components/icon";
import { Input } from "@/shared/components/input";
import { Panel } from "@/shared/components/panel";
import { Select } from "@/shared/components/select";
import { useAppStore } from "@/shared/hooks/use-app-store";
import { useWorkspaceStore } from "@/features/workspaces/store/use-workspace-store";
import { CredentialDTO, ProjectDTO } from "@/shared/types/dto";
import { cn } from "@/shared/lib/cn";
import Link from "next/link";

import { deleteCredential, listCredentials, startCredentialOAuth } from "../services/credentialsApi";
import { getProject } from "@/features/projects/services/projectsApi";

type SortKey = "updated" | "created" | "name";

export function CredentialsPage({ scope, projectId }: { scope: "personal" | "project"; projectId?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const showError = useAppStore((s) => s.showError);
  const showSuccess = useAppStore((s) => s.showSuccess);
  const setActiveProject = useWorkspaceStore((s) => s.setActiveProject);
  const setScope = useWorkspaceStore((s) => s.setScope);

  const [items, setItems] = useState<CredentialDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<ProjectDTO | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("updated");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const headerTitle = scope === "project" ? `Project Credentials` : "Credentials";
  const isAdmin = scope !== "project" || project?.role === "admin";
  const connected = searchParams.get("connected");
  const connectError = searchParams.get("error");

  const returnPath = useMemo(() => {
    if (typeof window === "undefined") return "/";
    return window.location.pathname;
  }, []);

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

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-10 bg-panel border-b border-border px-8 py-6">
        <div className="max-w-[1200px] mx-auto flex flex-col gap-4">
          {scope === "project" ? (
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-surface2 px-2 py-1">
                <span className="size-5 rounded-md bg-surface border border-border flex items-center justify-center text-[10px] font-semibold text-muted">
                  {(project?.name || "PR").slice(0, 2).toUpperCase()}
                </span>
                <span className="max-w-[220px] truncate">{project?.name || "Project"}</span>
              </span>
              <Icon name="chevron_right" className="text-[14px]" />
              <span className="text-text">Credentials</span>
            </div>
          ) : null}
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-text">{headerTitle}</h2>
              <p className="text-muted text-sm">
                {scope === "project"
                  ? `Manage credentials for ${project?.name || "this project"}.`
                  : "Manage your personal app connections."}
              </p>
              {!isAdmin && scope === "project" ? (
                <div className="text-xs text-muted mt-1">Only project admins can connect or disconnect credentials.</div>
              ) : null}
            </div>
            <div className="relative" ref={menuRef}>
              <div className="flex shadow-soft rounded-lg overflow-hidden">
                <Button
                  className="rounded-none px-5"
                  onClick={() => setMenuOpen((v) => !v)}
                  disabled={!isAdmin}
                >
                  <Icon name="add" className="text-[18px] mr-2" />
                  Create credential
                </Button>
                <button
                  type="button"
                  className="h-10 w-10 bg-accent text-white flex items-center justify-center border-l border-white/20 hover:bg-accentStrong transition-colors"
                  onClick={() => setMenuOpen((v) => !v)}
                  disabled={!isAdmin}
                  aria-label="Toggle credential menu"
                >
                  <Icon name="expand_more" className="text-[18px]" />
                </button>
              </div>
              {menuOpen ? (
                <div className="absolute right-0 mt-2 w-48 rounded-xl border border-border bg-panel shadow-lift overflow-hidden z-20">
                  <button
                    type="button"
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-text hover:bg-surface2 transition-colors"
                    onClick={() => {
                      setMenuOpen(false);
                      onConnect("google");
                    }}
                  >
                    <Icon name="google" className="text-[18px]" />
                    Connect Google
                  </button>
                  <button
                    type="button"
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-text hover:bg-surface2 transition-colors"
                    onClick={() => {
                      setMenuOpen(false);
                      onConnect("github");
                    }}
                  >
                    <Icon name="github" className="text-[18px]" />
                    Connect GitHub
                  </button>
                </div>
              ) : null}
            </div>
          </div>
          {projectNavItems.length ? (
            <div className="border-b border-border flex gap-6 overflow-x-auto">
              {projectNavItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href as any}
                  onClick={item.onClick}
                  className={cn(
                    "pb-3 text-sm font-medium transition-colors whitespace-nowrap",
                    item.active
                      ? "text-accent border-b-2 border-accent"
                      : "text-muted hover:text-text border-b-2 border-transparent"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </header>

      <div className="p-8">
        <div className="max-w-[1200px] mx-auto space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[260px] max-w-[420px]">
              <Icon name="search" className="absolute left-3 top-2.5 text-[18px] text-muted" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search credentials..."
                className="pl-9 bg-surface2 rounded-lg"
              />
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={sortKey}
                options={[
                  { value: "updated", label: "Sort by last updated" },
                  { value: "created", label: "Sort by created" },
                  { value: "name", label: "Sort by name" },
                ]}
                onChange={(value) => setSortKey(value as SortKey)}
                className="min-w-[200px]"
              />
              <button
                type="button"
                className="inline-flex items-center justify-center h-10 w-10 rounded-lg border border-border bg-surface hover:bg-surface2 text-muted hover:text-text transition-colors"
                title="Filter (coming soon)"
              >
                <Icon name="filter_list" className="text-[18px]" />
              </button>
            </div>
          </div>
          <Panel className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-text">Connected apps</h3>
                <p className="text-sm text-muted">Use these credentials in nodes.</p>
              </div>
              <Button variant="secondary" className="rounded-lg" onClick={reload} disabled={loading}>
                {loading ? "Refreshing..." : "Refresh"}
              </Button>
            </div>

            {loading ? (
              <div className="text-sm text-muted">Loading credentials...</div>
            ) : filtered.length === 0 ? (
              <div className="text-sm text-muted">No credentials connected yet.</div>
            ) : (
              <div className="divide-y divide-border">
                {filtered.map((item) => (
                  <div key={item.id} className="py-4 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="h-10 w-10 rounded-xl bg-surface2 border border-border flex items-center justify-center">
                        <Icon name={item.provider === "github" ? "github" : "google"} className="text-[18px]" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-text">{item.name}</div>
                        <div className="text-xs text-muted">
                          {item.provider.toUpperCase()} · Updated {formatDate(item.updatedAt)} · Created {formatDate(item.createdAt)}
                        </div>
                        <div className="text-xs text-muted truncate max-w-[420px]">
                          {item.accountEmail ? item.accountEmail : "Connected account"}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 rounded-md border border-border bg-surface2 text-xs text-muted">
                        {item.scope === "project" ? "Project" : "Personal"}
                      </span>
                      <Button
                        variant="secondary"
                        className="rounded-lg border-red text-red"
                        onClick={() => {
                          setSelectedId(item.id);
                          setConfirmDeleteOpen(true);
                        }}
                        disabled={!isAdmin}
                      >
                        Disconnect
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDeleteOpen}
        title="Disconnect credential?"
        description="This will remove the credential from FlowCraft. Any nodes using it will fail until you reconnect."
        confirmLabel="Disconnect"
        confirmVariant="danger"
        loading={deleting}
        onConfirm={onDelete}
        onClose={() => setConfirmDeleteOpen(false)}
      />
    </div>
  );
}

function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date);
}
