"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { useFlowsQuery } from "../hooks/use-flows";
import { useFlowActions } from "../hooks/use-flow-actions";
import { useFlowsStore } from "../store/use-flows-store";

import { useRunsQuery } from "@/features/runs/hooks/use-runs";
import { useRunFlow } from "@/features/runs/hooks/use-run-flow";
import { useRunsStore } from "@/features/runs/store/use-runs-store";

import { Badge } from "@/shared/components/badge";
import { Button } from "@/shared/components/button";
import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import { Icon } from "@/shared/components/icon";
import { Input } from "@/shared/components/input";
import { Select } from "@/shared/components/select";
import { useAppStore, useMounted } from "@/shared/hooks/use-app-store";
import { cn } from "@/shared/lib/cn";
import { FlowDTO, RunDTO } from "@/shared/types/dto";
import { useWorkspaceStore } from "@/features/workspaces/store/use-workspace-store";

type ConfirmState = { type: "archive" | "delete"; flow: FlowDTO } | null;

type RunMeta = {
  when: string;
  icon: string;
  label: string;
  className: string;
};

export function FlowsPage() {
  const { loading: flowsLoading, error: flowsError, reload: reloadFlows } = useFlowsQuery();
  const { loading: runsLoading, reload: reloadRuns } = useRunsQuery();

  const flows = useFlowsStore((s) => s.items);
  const runs = useRunsStore((s) => s.items);

  const router = useRouter();
  const mounted = useMounted();
  const scopeRaw = useWorkspaceStore((s) => s.activeScope);
  const activeProjectIdRaw = useWorkspaceStore((s) => s.activeProjectId);
  const projects = useWorkspaceStore((s) => s.projects);
  const scope = mounted ? scopeRaw : "personal";
  const activeProjectId = mounted ? activeProjectIdRaw : null;
  const activeProject = useMemo(
    () => projects.find((p) => p.id === activeProjectId) || null,
    [activeProjectId, projects]
  );

  const pageTitle =
    scope === "project" ? (activeProject ? `Project: ${activeProject.name}` : "Project Workflows") : "Personal Workflows";
  const pageSubtitle =
    scope === "project"
      ? activeProject
        ? "Workflows shared within this project."
        : "Select a project to view project workflows."
      : "Workflows owned by you.";
  const showSuccess = useAppStore((s) => s.showSuccess);
  const showError = useAppStore((s) => s.showError);
  const showInfo = useAppStore((s) => s.showInfo);

  const {
    importFlowFromFile,
    importing,
    duplicateExistingFlow,
    duplicatingId,
    archiveExistingFlow,
    archivingId,
    deleteExistingFlow,
    deletingId,
  } = useFlowActions();
  const { startRun, running, runningFlowId } = useRunFlow();

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | FlowDTO["status"]>("all");
  const [owner, setOwner] = useState<string>("all");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState(() => new Set<string>());
  const [menuOpenFor, setMenuOpenFor] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<ConfirmState>(null);
  const [createMenuOpen, setCreateMenuOpen] = useState(false);

  const fileRef = useRef<HTMLInputElement | null>(null);
  const createMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!createMenuOpen) return;
    const onMouseDown = (e: MouseEvent) => {
      const el = createMenuRef.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) setCreateMenuOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCreateMenuOpen(false);
    };
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [createMenuOpen]);

  const ownerForFlow = (flow: FlowDTO) => {
    if (flow.status === "archived") return "System";
    return flow.owner?.name || flow.owner?.email || "Unknown";
  };

  const ownerOptions = useMemo(() => {
    const unique = new Set<string>();
    for (const flow of flows) unique.add(ownerForFlow(flow));
    return ["all", ...Array.from(unique).sort((a, b) => a.localeCompare(b))];
  }, [flows]);

  useEffect(() => {
    if (owner === "all") return;
    if (ownerOptions.includes(owner)) return;
    setOwner("all");
  }, [owner, ownerOptions]);

  const runSortTime = (run: RunDTO) => {
    const raw = run.createdAt || run.startedAt || run.updatedAt;
    if (!raw) return 0;
    const t = new Date(raw).getTime();
    return Number.isFinite(t) ? t : 0;
  };

  const lastRunByFlowId = useMemo(() => {
    const map = new Map<string, RunDTO>();
    for (const run of runs) {
      const t = runSortTime(run);
      const existing = map.get(run.flowId);
      if (!existing || t > runSortTime(existing)) map.set(run.flowId, run);
    }
    return map;
  }, [runs]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return flows
      .filter((flow) => (status === "all" ? true : flow.status === status))
      .filter((flow) => (owner === "all" ? true : ownerForFlow(flow) === owner))
      .filter((flow) => (!q ? true : flow.name.toLowerCase().includes(q) || flow.id.toLowerCase().includes(q)))
      .sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
  }, [flows, owner, query, status]);

  useEffect(() => setPage(1), [query, status, owner, pageSize]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageSafe = Math.min(page, pageCount);
  const pageStartIdx = (pageSafe - 1) * pageSize;
  const pageItems = filtered.slice(pageStartIdx, pageStartIdx + pageSize);

  useEffect(() => {
    if (page !== pageSafe) setPage(pageSafe);
  }, [page, pageSafe]);

  const allSelectedOnPage = pageItems.length > 0 && pageItems.every((flow) => selectedIds.has(flow.id));

  const toggleSelectFlow = (flowId: string, next?: boolean) => {
    setSelectedIds((prev) => {
      const copy = new Set(prev);
      const shouldSelect = next ?? !copy.has(flowId);
      if (shouldSelect) copy.add(flowId);
      else copy.delete(flowId);
      return copy;
    });
  };

  const toggleSelectAllOnPage = () => {
    setSelectedIds((prev) => {
      const copy = new Set(prev);
      const shouldSelectAll = !allSelectedOnPage;
      for (const flow of pageItems) {
        if (shouldSelectAll) copy.add(flow.id);
        else copy.delete(flow.id);
      }
      return copy;
    });
  };

  const onImportClick = () => fileRef.current?.click();

  const onImportFile = async (file: File) => {
    try {
      const { flow } = await importFlowFromFile(file);
      router.push(`/flows/${flow.id}/builder`);
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const onReload = () => {
    reloadFlows();
    reloadRuns();
  };

  const onRunFlow = async (flowId: string) => {
    try {
      const run = await startRun(flowId);
      showSuccess("Run started", run.id.slice(0, 8));
      router.push(`/runs/${run.id}`);
    } catch (err: any) {
      showError("Run failed", err?.message || "Unable to start run");
    }
  };

  useEffect(() => {
    if (!menuOpenFor) return;
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      const el = document.querySelector(`[data-flow-menu-root="${menuOpenFor}"]`);
      if (!el || !el.contains(target)) setMenuOpenFor(null);
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [menuOpenFor]);

  const statusTone = (s: FlowDTO["status"]) => {
    if (s === "active") return "success";
    if (s === "archived") return "warning";
    return "default";
  };

  const formatRelative = (raw?: string) => {
    if (!raw) return "Never";
    const d = new Date(raw);
    if (!Number.isFinite(d.getTime())) return "Never";
    const diffMs = Date.now() - d.getTime();
    const sec = Math.round(diffMs / 1000);
    if (sec < 10) return "Just now";
    const min = Math.round(sec / 60);
    if (min < 60) return `${min} min${min === 1 ? "" : "s"} ago`;
    const hrs = Math.round(min / 60);
    if (hrs < 24) return `${hrs} hour${hrs === 1 ? "" : "s"} ago`;
    const days = Math.round(hrs / 24);
    return `${days} day${days === 1 ? "" : "s"} ago`;
  };

  const formatUpdatedAt = (raw?: string) => {
    if (!raw) return "-";
    const d = new Date(raw);
    if (!Number.isFinite(d.getTime())) return "-";
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(d);
  };

  const initialsFor = (name: string) => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "?";
    const first = parts[0]?.[0] || "";
    const last = parts.length > 1 ? parts[parts.length - 1]?.[0] || "" : "";
    return (first + last).toUpperCase();
  };

  const avatarStyle = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = (hash * 31 + name.charCodeAt(i)) % 360;
    }
    const hue = hash;
    return {
      background: `hsl(${hue} 80% 92%)`,
      color: `hsl(${hue} 45% 28%)`,
    };
  };

  const runMeta = (flowId: string): RunMeta | null => {
    const run = lastRunByFlowId.get(flowId);
    if (!run) return null;
    const when = formatRelative(run.createdAt || run.startedAt || run.updatedAt);

    if (run.status === "success") return { when, icon: "check_circle", label: "Success", className: "text-green" };

    if (run.status === "failed") {
      const firstLine = (run.log || "Failed").split("\n")[0] || "Failed";
      const message = firstLine.length > 28 ? `${firstLine.slice(0, 28)}…` : firstLine;
      return { when, icon: "error", label: message, className: "text-red" };
    }

    if (run.status === "running") return { when, icon: "play_circle", label: "Running", className: "text-accent" };

    return { when, icon: "schedule", label: "Queued", className: "text-muted" };
  };

  const confirmTitle =
    confirm?.type === "archive" ? "Archive flow?" : confirm?.type === "delete" ? "Delete flow?" : "";

  const confirmDesc =
    confirm?.type === "archive"
      ? `This will mark "${confirm.flow.name}" as archived.`
      : confirm?.type === "delete"
        ? `This will permanently delete "${confirm.flow.name}".`
        : undefined;

  const confirmLoading =
    (confirm?.type === "archive" && archivingId === confirm.flow.id) ||
    (confirm?.type === "delete" && deletingId === confirm.flow.id);

  const onConfirm = async () => {
    if (!confirm) return;
    try {
      if (confirm.type === "archive") await archiveExistingFlow(confirm.flow);
      if (confirm.type === "delete") await deleteExistingFlow(confirm.flow);
      setConfirm(null);
    } catch {
      // toasts handled by hooks
    }
  };

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-10 bg-panel border-b border-border px-8 py-6">
        <div className="max-w-[1600px] mx-auto flex flex-col gap-6">
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-1">
              <h2 className="text-2xl font-bold tracking-tight text-text">{pageTitle}</h2>
              <p className="text-muted text-sm">{pageSubtitle}</p>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-3 w-full lg:w-auto">
              <div ref={createMenuRef} className="relative">
                <Button
                  size="md"
                  className="h-10 px-4 rounded-lg gap-2"
                  onClick={() => setCreateMenuOpen((v) => !v)}
                >
                  <Icon name="add" className="text-[18px]" />
                  Create workflow
                  <Icon
                    name="expand_more"
                    className={cn("text-[18px] transition-transform", createMenuOpen ? "rotate-180" : "")}
                  />
                </Button>

                {createMenuOpen ? (
                  <div className="absolute left-0 top-full mt-2 w-56 rounded-xl border border-border bg-panel shadow-lift overflow-hidden z-30">
                    <button
                      type="button"
                      className="w-full text-left px-3 py-2 text-sm hover:bg-surface2 transition-colors"
                      onClick={() => {
                        setCreateMenuOpen(false);
                        router.push("/flows/new?scope=personal");
                      }}
                    >
                      Personal workflow
                    </button>
                    <button
                      type="button"
                      className={cn(
                        "w-full text-left px-3 py-2 text-sm transition-colors",
                        scope === "project" && activeProjectId
                          ? "hover:bg-surface2"
                          : "text-muted opacity-60 cursor-not-allowed"
                      )}
                      disabled={!(scope === "project" && activeProjectId)}
                      onClick={() => {
                        if (!(scope === "project" && activeProjectId)) return;
                        setCreateMenuOpen(false);
                        router.push(`/flows/new?scope=project&projectId=${encodeURIComponent(activeProjectId)}`);
                      }}
                    >
                      {scope === "project" && activeProject ? `Project workflow (${activeProject.name})` : "Project workflow"}
                    </button>
                  </div>
                ) : null}
              </div>
              <Button variant="secondary" size="md" className="h-10 px-4 rounded-lg" onClick={onImportClick}>
                <Icon name="download" className="text-[20px] mr-2" />
                {importing ? "Importing..." : "Import Flow"}
              </Button>
              <input
                ref={fileRef}
                type="file"
                accept="application/json"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void onImportFile(f);
                }}
              />
            </div>

            <div className="flex flex-1 w-full lg:w-auto lg:justify-end items-center gap-3">
              <div className="relative w-full max-w-sm group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Icon name="search" className="text-[20px] text-muted" />
                </div>
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search flows..."
                  className="h-10 pl-10 rounded-lg shadow-soft"
                />
              </div>

              <Select
                className="hidden md:block w-[170px]"
                value={status}
                onChange={(v) => setStatus(v as any)}
                leadingIcon="filter_list"
                options={[
                  { value: "all", label: "All statuses" },
                  { value: "draft", label: "Draft" },
                  { value: "active", label: "Active" },
                  { value: "archived", label: "Archived" },
                ]}
              />

              <Select
                className="hidden md:block w-[220px]"
                value={owner}
                onChange={setOwner}
                leadingIcon="person"
                searchable
                searchPlaceholder="Search owners…"
                options={ownerOptions.map((value) => ({
                  value,
                  label: value === "all" ? "All owners" : value,
                }))}
              />

              <div className="border-l border-border pl-3 ml-1 hidden md:flex items-center gap-1">
                <button
                  type="button"
                  className="p-1.5 rounded hover:bg-surface2 text-muted hover:text-text transition-colors"
                  title="Grid view (coming soon)"
                  onClick={() => showInfo("Grid view", "Grid view is coming soon.")}
                >
                  <Icon name="grid_view" className="text-[20px]" />
                </button>
                <button
                  type="button"
                  className="p-1.5 rounded bg-surface2 text-accent transition-colors"
                  title="List view"
                >
                  <Icon name="view_list" className="text-[20px]" />
                </button>
                <button
                  type="button"
                  className="p-1.5 rounded hover:bg-surface2 text-muted hover:text-text transition-colors disabled:opacity-60"
                  title="Refresh"
                  onClick={onReload}
                  disabled={flowsLoading || runsLoading}
                >
                  <Icon name="refresh" className="text-[20px]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="p-8 pt-0">
        <div className="max-w-[1600px] mx-auto space-y-4 pt-6">
          {flowsError && flows.length === 0 ? (
            <div className="rounded-xl border border-border bg-panel p-4 text-sm text-muted flex items-center justify-between">
              <div>Failed to load flows.</div>
              <Button variant="secondary" size="sm" onClick={onReload}>
                Retry
              </Button>
            </div>
          ) : null}

            <div className="bg-panel border border-border rounded-xl shadow-soft">
              <div className="grid grid-cols-12 gap-4 px-6 py-3 pr-36 bg-surface2 border-b border-border items-center text-xs font-semibold text-muted uppercase tracking-wider">
                <div className="col-span-4 flex items-center gap-3">
                  <input
                    type="checkbox"
                    className="size-4 rounded border-border text-accent focus:shadow-focus"
                  checked={allSelectedOnPage}
                  onChange={toggleSelectAllOnPage}
                  disabled={pageItems.length === 0}
                  aria-label="Select all flows on page"
                  onClick={(e) => e.stopPropagation()}
                />
                <span>Name</span>
              </div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Last run</div>
                <div className="col-span-2">Owner</div>
                <div className="col-span-2 text-right">Updated</div>
              </div>

            {flowsLoading && filtered.length === 0 ? (
              <div className="px-6 py-6 text-sm text-muted">Loading…</div>
            ) : pageItems.length ? (
              <div>
                {pageItems.map((flow) => {
                  const meta = runMeta(flow.id);
                  const ownerName = ownerForFlow(flow);
                  const isSelected = selectedIds.has(flow.id);
                  return (
                    <div
                      key={flow.id}
                      className="group grid grid-cols-12 gap-4 px-6 py-3 pr-36 border-b border-border last:border-0 items-center hover:bg-surface2 transition-colors cursor-pointer relative"
                      onClick={() => router.push(`/flows/${flow.id}/builder`)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") router.push(`/flows/${flow.id}/builder`);
                      }}
                    >
                      <div className="col-span-4 flex items-center gap-3 min-w-0">
                        <input
                          type="checkbox"
                          className={cn(
                            "size-4 rounded border-border text-accent focus:shadow-focus transition-opacity",
                            isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                          )}
                          checked={isSelected}
                          onChange={(e) => toggleSelectFlow(flow.id, e.target.checked)}
                          aria-label={`Select ${flow.name}`}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-semibold text-text truncate group-hover:text-accent transition-colors">
                            {flow.name}
                          </span>
                          <span className="text-xs text-muted font-mono mt-0.5 truncate">id: {flow.id.slice(0, 10)}…</span>
                        </div>
                      </div>

                      <div className="col-span-2">
                        <Badge label={flow.status} tone={statusTone(flow.status)} />
                      </div>

                      <div className="col-span-2 flex flex-col min-w-0">
                        <span className="text-sm text-text">{meta?.when || "Never"}</span>
                        {meta ? (
                          <span className={cn("text-xs flex items-center gap-1 truncate", meta.className)}>
                            <Icon name={meta.icon} className="text-[14px]" />
                            <span className="truncate">{meta.label}</span>
                          </span>
                        ) : (
                          <span className="text-xs text-muted">—</span>
                        )}
                      </div>

                      <div className="col-span-2 flex items-center gap-2 min-w-0">
                        <div
                          className="size-6 rounded-full flex items-center justify-center text-[10px] font-bold border border-border shrink-0"
                          style={avatarStyle(ownerName)}
                        >
                          {initialsFor(ownerName)}
                        </div>
                        <span className="text-sm text-text truncate">{ownerName}</span>
                      </div>

                      <div className="col-span-2 text-right text-sm text-muted font-mono">{formatUpdatedAt(flow.updatedAt)}</div>

                      <div
                        className={cn(
                          "absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-panel shadow-soft border border-border rounded-lg p-1 transition-all z-10",
                          menuOpenFor === flow.id
                            ? "opacity-100"
                            : "opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto"
                        )}
                        data-flow-menu-root={flow.id}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          className="p-1.5 hover:bg-surface2 rounded text-muted hover:text-accent transition-colors disabled:opacity-60"
                          title="Run now"
                          disabled={running || (runningFlowId ? runningFlowId !== flow.id : false)}
                          onClick={() => void onRunFlow(flow.id)}
                        >
                          <Icon name="play_arrow" className="text-[18px]" />
                        </button>
                        <button
                          type="button"
                          className="p-1.5 hover:bg-surface2 rounded text-muted hover:text-text transition-colors"
                          title="Edit"
                          onClick={() => router.push(`/flows/${flow.id}/builder`)}
                        >
                          <Icon name="edit" className="text-[18px]" />
                        </button>
                        <button
                          type="button"
                          className="p-1.5 hover:bg-surface2 rounded text-muted hover:text-text transition-colors"
                          title="More"
                          onClick={() => setMenuOpenFor((cur) => (cur === flow.id ? null : flow.id))}
                        >
                          <Icon name="more_horiz" className="text-[18px]" />
                        </button>

                        {menuOpenFor === flow.id ? (
                          <FlowRowMenu
                            flow={flow}
                            duplicateExistingFlow={duplicateExistingFlow}
                            duplicating={duplicatingId === flow.id}
                            archiving={archivingId === flow.id}
                            deleting={deletingId === flow.id}
                            onArchive={() => setConfirm({ type: "archive", flow })}
                            onDelete={() => setConfirm({ type: "delete", flow })}
                            onClose={() => setMenuOpenFor(null)}
                            onCopied={() => showSuccess("Copied", "Flow ID copied to clipboard.")}
                            onCopyFailed={() => showInfo("Copy failed", "Unable to copy flow ID.")}
                            onOpen={(id) => router.push(`/flows/${id}/builder`)}
                          />
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="px-6 py-8 text-sm text-muted">
                {scope === "project"
                  ? activeProject
                    ? "This project has no workflows yet."
                    : "Select a project to view workflows."
                  : "No personal workflows yet. Create your first automation."}
              </div>
            )}
          </div>

          <div className="pt-2 flex items-center justify-between">
            <div className="text-sm text-muted">
              {filtered.length === 0 ? (
                "Showing 0 flows"
              ) : (
                <>
                  Showing{" "}
                  <span className="font-medium text-text">
                    {pageStartIdx + 1}-{Math.min(pageStartIdx + pageItems.length, filtered.length)}
                  </span>{" "}
                  of <span className="font-medium text-text">{filtered.length}</span> flows
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Select
                className="w-[150px]"
                value={pageSize}
                onChange={(v) => setPageSize(Number(v))}
                options={[
                  { value: 10, label: "10 per page" },
                  { value: 25, label: "25 per page" },
                  { value: 50, label: "50 per page" },
                ]}
              />

              <div className="flex items-center rounded-lg border border-border bg-surface overflow-hidden">
                <button
                  type="button"
                  className="px-3 h-9 border-r border-border hover:bg-surface2 disabled:opacity-50 transition-colors"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={pageSafe <= 1}
                  aria-label="Previous page"
                >
                  <Icon name="chevron_left" className="text-[18px] text-muted" />
                </button>
                <div className="px-4 h-9 flex items-center text-sm font-medium text-text">{pageSafe}</div>
                <button
                  type="button"
                  className="px-3 h-9 border-l border-border hover:bg-surface2 disabled:opacity-50 transition-colors"
                  onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                  disabled={pageSafe >= pageCount}
                  aria-label="Next page"
                >
                  <Icon name="chevron_right" className="text-[18px] text-muted" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(confirm)}
        title={confirmTitle}
        description={confirmDesc}
        confirmLabel={confirm?.type === "delete" ? "Delete" : "Archive"}
        confirmVariant={confirm?.type === "delete" ? "danger" : "primary"}
        loading={Boolean(confirmLoading)}
        onConfirm={onConfirm}
        onClose={() => setConfirm(null)}
      />
    </div>
  );
}

function FlowRowMenu({
  flow,
  duplicateExistingFlow,
  duplicating,
  archiving,
  deleting,
  onArchive,
  onDelete,
  onClose,
  onCopied,
  onCopyFailed,
  onOpen,
}: {
  flow: FlowDTO;
  duplicateExistingFlow: (flow: FlowDTO) => Promise<FlowDTO>;
  duplicating: boolean;
  archiving: boolean;
  deleting: boolean;
  onArchive: () => void;
  onDelete: () => void;
  onClose: () => void;
  onCopied: () => void;
  onCopyFailed: () => void;
  onOpen: (id: string) => void;
}) {
  return (
    <div className="absolute right-0 top-full mt-1 w-44 rounded-lg border border-border bg-panel shadow-lift overflow-hidden">
      <button
        type="button"
        className="w-full text-left px-3 py-2 text-sm hover:bg-surface2 transition-colors disabled:opacity-60"
        onClick={async () => {
          onClose();
          try {
            const created = await duplicateExistingFlow(flow);
            onOpen(created.id);
          } catch {}
        }}
        disabled={duplicating}
      >
        {duplicating ? "Duplicating…" : "Duplicate"}
      </button>

      <button
        type="button"
        className="w-full text-left px-3 py-2 text-sm hover:bg-surface2 transition-colors disabled:opacity-60"
        onClick={() => {
          onClose();
          onArchive();
        }}
        disabled={archiving || flow.status === "archived"}
      >
        {flow.status === "archived" ? "Archived" : archiving ? "Archiving…" : "Archive"}
      </button>

      <button
        type="button"
        className="w-full text-left px-3 py-2 text-sm hover:bg-surface2 transition-colors"
        onClick={async () => {
          onClose();
          try {
            await navigator.clipboard.writeText(flow.id);
            onCopied();
          } catch {
            onCopyFailed();
          }
        }}
      >
        Copy ID
      </button>

      <button
        type="button"
        className="w-full text-left px-3 py-2 text-sm text-red hover:bg-surface2 transition-colors disabled:opacity-60"
        onClick={() => {
          onClose();
          onDelete();
        }}
        disabled={deleting}
      >
        {deleting ? "Deleting…" : "Delete"}
      </button>
    </div>
  );
}
