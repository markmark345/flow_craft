"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/shared/components/button";
import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import { FlowsHeader } from "./flows-header";
import { FlowsPagination } from "./flows-pagination";
import { FlowsTable } from "./flows-table";
import { useFlowsPage } from "../hooks/use-flows-page";
import { useFlowActions } from "../hooks/use-flow-actions";

export function FlowsPage() {
  const router = useRouter();
  const {
    flowsLoading,
    runsLoading,
    flowsError,
    importing,
    duplicatingId,
    archivingId,
    deletingId,
    running,
    runningFlowId,
    flows,
    filtered,
    pageItems,
    pageCount,
    pageSize,
    pageStartIdx,
    pageSafe,
    query,
    status,
    owner,
    ownerOptions,
    selectedIds,
    allSelectedOnPage,
    scope,
    activeProject,
    pageTitle,
    pageSubtitle,
    canCreateProject,
    projectLabel,
    confirm,
    confirmTitle,
    confirmDesc,
    confirmLoading,
    showSuccess,
    showError,
    showInfo,
    setQuery,
    setStatus,
    setOwner,
    setPageSize,
    setPage,
    toggleSelectFlow,
    toggleSelectAllOnPage,
    onImportFile,
    onReload,
    onRunFlow,
    runMetaForFlow,
    setConfirm,
    onConfirm,
    onCreatePersonal,
    onCreateProject,
  } = useFlowsPage();

  const { duplicateExistingFlow } = useFlowActions();

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
            runningFlowId={runningFlowId ?? null}
            runMetaForFlow={runMetaForFlow}
            duplicateExistingFlow={duplicateExistingFlow}
            duplicatingId={duplicatingId ?? null}
            archivingId={archivingId ?? null}
            deletingId={deletingId ?? null}
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
            onPrev={() => setPage(Math.max(1, pageSafe - 1))}
            onNext={() => setPage(Math.min(pageCount, pageSafe + 1))}
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
