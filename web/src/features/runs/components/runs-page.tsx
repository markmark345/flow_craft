"use client";

import { Button } from "@/components/ui/button";
import { useRunsPage } from "../hooks/use-runs-page";
import { RunsHeader } from "./runs/RunsHeader";
import { RunsTable } from "./runs/RunsTable";
import { RunsPagination } from "./runs/RunsPagination";

export function RunsPage() {
  const {
    runsLoading,
    runs,
    flowsLoading,
    runsError,
    running,
    runningFlowId,
    filtered,
    pageItems,
    flowsById,
    flows,
    query,
    status,
    timeframe,
    flowId,
    autoRefresh,
    pageSize,
    pageSafe,
    pageStartIdx,
    pageCount,
    setQuery,
    setStatus,
    setTimeframe,
    setFlowId,
    setPageSize,
    setPage,
    setAutoRefresh,
    refreshAll,
    exportLogs,
    startRunForFlow,
    navigateToRun,
    getTone,
  } = useRunsPage();

  const runningAny = runsLoading || flowsLoading;

  return (
    <div className="min-h-screen bg-bg">
      <RunsHeader
        query={query}
        setQuery={setQuery}
        status={status}
        setStatus={setStatus}
        timeframe={timeframe}
        setTimeframe={setTimeframe}
        flowId={flowId}
        setFlowId={setFlowId}
        autoRefresh={autoRefresh}
        setAutoRefresh={setAutoRefresh}
        filteredCount={filtered.length}
        pageStartIdx={pageStartIdx}
        pageItemCount={pageItems.length}
        exportLogs={exportLogs}
        refreshAll={refreshAll}
        runningAny={runningAny}
        flows={flows}
      />

      <div className="p-8">
        <div className="max-w-[1400px] mx-auto space-y-4">
          {runsError && runs.length === 0 ? (
            <div className="rounded-xl border border-border bg-panel p-4 text-sm text-muted flex items-center justify-between">
              <div>Failed to load runs.</div>
              <Button variant="secondary" size="sm" onClick={refreshAll}>
                Retry
              </Button>
            </div>
          ) : null}

          <div className="bg-panel border border-border rounded-xl shadow-soft overflow-hidden">
            <RunsTable
              runsLoading={runsLoading}
              filteredCount={filtered.length}
              pageItems={pageItems}
              flowsById={flowsById}
              running={running}
              runningFlowId={runningFlowId}
              getTone={getTone}
              navigateToRun={navigateToRun}
              startRunForFlow={startRunForFlow}
            />

            <RunsPagination
              filteredCount={filtered.length}
              pageStartIdx={pageStartIdx}
              pageItemCount={pageItems.length}
              pageSize={pageSize}
              setPageSize={setPageSize}
              pageSafe={pageSafe}
              pageCount={pageCount}
              setPage={setPage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
