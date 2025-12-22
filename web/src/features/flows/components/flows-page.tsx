"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useFlowsQuery } from "../hooks/use-flows";
import { useFlowActions } from "../hooks/use-flow-actions";
import { useFlowsStore } from "../store/use-flows-store";

import { useRunsQuery } from "@/features/runs/hooks/use-runs";
import { useRunFlow } from "@/features/runs/hooks/use-run-flow";
import { useRunsStore } from "@/features/runs/store/use-runs-store";

import { Button } from "@/shared/components/button";
import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import { useAppStore, useMounted } from "@/shared/hooks/use-app-store";
import { FlowDTO, RunDTO } from "@/shared/types/dto";
import { useWorkspaceStore } from "@/features/workspaces/store/use-workspace-store";

import { FlowsHeader } from "./flows-header";
import { FlowsPagination } from "./flows-pagination";
import { FlowsTable } from "./flows-table";
import { ownerForFlow, runMeta, runSortTime } from "./flows-page-utils";

type ConfirmState = { type: "archive" | "delete"; flow: FlowDTO } | null;

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
  const [confirm, setConfirm] = useState<ConfirmState>(null);

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

  const lastRunByFlowId = useMemo(() => {
    const map = new Map<string, RunDTO>();
    for (const run of runs) {
      const t = runSortTime(run);
      const existing = map.get(run.flowId);
      if (!existing || t > runSortTime(existing)) map.set(run.flowId, run);
    }
    return map;
  }, [runs]);

  const runMetaForFlow = (flowId: string) => runMeta(lastRunByFlowId.get(flowId));

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

  const onImportFile = async (file: File) => {
    const { flow } = await importFlowFromFile(file);
    router.push(`/flows/${flow.id}/builder`);
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

  const canCreateProject = scope === "project" && Boolean(activeProjectId);
  const projectLabel =
    scope === "project" && activeProject ? `Project workflow (${activeProject.name})` : "Project workflow";

  const onCreatePersonal = () => router.push("/flows/new?scope=personal");
  const onCreateProject = () => {
    if (!activeProjectId) return;
    router.push(`/flows/new?scope=project&projectId=${encodeURIComponent(activeProjectId)}`);
  };

  const emptyStateMessage =
    scope === "project"
      ? activeProject
        ? "This project has no workflows yet."
        : "Select a project to view workflows."
      : "No personal workflows yet. Create your first automation.";

  return (
    <div className="min-h-screen bg-bg">
      <FlowsHeader
        pageTitle={pageTitle}
        pageSubtitle={pageSubtitle}
        importing={importing}
        onImportFile={onImportFile}
        onCreatePersonal={onCreatePersonal}
        onCreateProject={onCreateProject}
        canCreateProject={canCreateProject}
        projectLabel={projectLabel}
        query={query}
        onQueryChange={setQuery}
        status={status}
        onStatusChange={setStatus}
        owner={owner}
        onOwnerChange={setOwner}
        ownerOptions={ownerOptions}
        onReload={onReload}
        flowsLoading={flowsLoading}
        runsLoading={runsLoading}
        onShowInfo={showInfo}
      />

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

          <FlowsTable
            flowsLoading={flowsLoading}
            filteredCount={filtered.length}
            pageItems={pageItems}
            allSelectedOnPage={allSelectedOnPage}
            selectedIds={selectedIds}
            toggleSelectAllOnPage={toggleSelectAllOnPage}
            toggleSelectFlow={toggleSelectFlow}
            onRowOpen={(id) => router.push(`/flows/${id}/builder`)}
            onRunFlow={onRunFlow}
            running={running}
            runningFlowId={runningFlowId}
            runMetaForFlow={runMetaForFlow}
            duplicateExistingFlow={duplicateExistingFlow}
            duplicatingId={duplicatingId}
            archivingId={archivingId}
            deletingId={deletingId}
            onArchive={(flow) => setConfirm({ type: "archive", flow })}
            onDelete={(flow) => setConfirm({ type: "delete", flow })}
            onCopied={() => showSuccess("Copied", "Flow ID copied to clipboard.")}
            onCopyFailed={() => showInfo("Copy failed", "Unable to copy flow ID.")}
            emptyStateMessage={emptyStateMessage}
          />

          <FlowsPagination
            filteredCount={filtered.length}
            pageStartIdx={pageStartIdx}
            pageItemsLength={pageItems.length}
            pageSafe={pageSafe}
            pageCount={pageCount}
            pageSize={pageSize}
            onPageSizeChange={setPageSize}
            onPrev={() => setPage((p) => Math.max(1, p - 1))}
            onNext={() => setPage((p) => Math.min(pageCount, p + 1))}
          />
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
