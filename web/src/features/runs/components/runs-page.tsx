"use client";

import { Button } from "@/shared/components/button";
import { Input } from "@/shared/components/input";
import { Badge } from "@/shared/components/badge";
import { useMemo } from "react";
import { RunDTO } from "@/shared/types/dto";
import { Icon } from "@/shared/components/icon";
import { useRunsPage } from "../hooks/use-runs-page";

export function RunsPage() {
  const {
    runsLoading,
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
      <header className="sticky top-0 z-10 bg-panel border-b border-border px-8 py-6">
        <div className="max-w-[1400px] mx-auto flex flex-col gap-4">
          <div className="flex items-start justify-between gap-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-text">Run History</h1>
              <p className="text-sm text-muted">
                Showing{" "}
                <span className="font-medium text-text">
                  {filtered.length === 0 ? 0 : pageStartIdx + 1}-{Math.min(pageStartIdx + pageItems.length, filtered.length)}
                </span>{" "}
                of <span className="font-medium text-text">{filtered.length}</span> executions
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                size="sm"
                className="h-9 px-4 rounded-lg"
                onClick={exportLogs}
                disabled={filtered.length === 0}
              >
                <Icon name="download" className="text-[18px] mr-2" />
                Export Logs
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="h-9 px-4 rounded-lg"
                onClick={refreshAll}
                disabled={runningAny}
              >
                <Icon name="refresh" className="text-[18px] mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon name="search" className="text-[18px] text-muted" />
              </div>
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search Run ID or Flow Name..."
                className="h-10 pl-10 rounded-lg bg-surface2 shadow-soft"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <select
                className="h-10 rounded-lg bg-surface2 border border-border px-3 text-sm text-text focus:outline-none focus:shadow-focus"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
              >
                <option value="all">Status: All</option>
                <option value="queued">Queued</option>
                <option value="running">Running</option>
                <option value="success">Success</option>
                <option value="failed">Failed</option>
                <option value="canceled">Canceled</option>
              </select>

              <select
                className="h-10 rounded-lg bg-surface2 border border-border px-3 text-sm text-text focus:outline-none focus:shadow-focus"
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value as any)}
              >
                <option value="24h">Timeframe: Last 24h</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="all">All time</option>
              </select>

              <select
                className="h-10 rounded-lg bg-surface2 border border-border px-3 text-sm text-text focus:outline-none focus:shadow-focus max-w-[240px]"
                value={flowId}
                onChange={(e) => setFlowId(e.target.value)}
              >
                <option value="all">Flow: All Flows</option>
                {flows.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>

              <div className="ml-auto flex items-center gap-2">
                <span className="text-sm text-muted">Auto-refresh</span>
                <Toggle checked={autoRefresh} onChange={setAutoRefresh} />
              </div>
            </div>
          </div>
        </div>
      </header>

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
            <div className="overflow-auto">
              <table className="min-w-[1100px] w-full text-sm">
                <thead className="bg-surface2 text-muted text-xs uppercase tracking-wider">
                  <tr>
                    <th className="text-left font-semibold px-4 py-3">Status</th>
                    <th className="text-left font-semibold px-4 py-3">Flow Name</th>
                    <th className="text-left font-semibold px-4 py-3">Run ID</th>
                    <th className="text-left font-semibold px-4 py-3">Trigger</th>
                    <th className="text-left font-semibold px-4 py-3">Start Time</th>
                    <th className="text-left font-semibold px-4 py-3">Duration</th>
                    <th className="text-left font-semibold px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {runsLoading && filtered.length === 0 ? (
                    <tr>
                      <td className="px-4 py-6 text-muted" colSpan={7}>
                        Loading...
                      </td>
                    </tr>
                  ) : pageItems.length ? (
                    pageItems.map((run) => (
                      <tr
                        key={run.id}
                        className="hover:bg-surface2 transition-colors cursor-pointer"
                        onClick={() => navigateToRun(run.id)}
                      >
                        <td className="px-4 py-3">
                          <Badge label={run.status} tone={getTone(run.status)} />
                        </td>
                        <td className="px-4 py-3 font-medium text-text">{flowsById.get(run.flowId) || "Unknown flow"}</td>
                        <td className="px-4 py-3 font-mono text-xs text-muted">{shortId(run.id)}</td>
                        <td className="px-4 py-3 text-muted">
                          <span className="inline-flex items-center gap-2">
                            <Icon name="data_object" className="text-[16px] text-muted" />
                            API
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-text">{formatDate(run.createdAt || run.startedAt)}</div>
                          <div className="text-xs text-muted">{formatRelative(run.createdAt || run.startedAt)}</div>
                        </td>
                        <td className="px-4 py-3 text-muted">{formatDuration(run.startedAt, run.finishedAt)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              className="h-8 w-8 rounded-md border border-border bg-surface hover:bg-surface2 flex items-center justify-center"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigateToRun(run.id);
                              }}
                              title="View run"
                            >
                              <Icon name="open_in_full" className="text-[16px] text-muted" />
                            </button>
                            <button
                              type="button"
                              className="h-8 w-8 rounded-md border border-border bg-surface hover:bg-surface2 flex items-center justify-center disabled:opacity-60"
                              disabled={running && runningFlowId === run.flowId}
                              onClick={async (e) => {
                                e.stopPropagation();
                                try {
                                  await startRunForFlow(run.flowId);
                                } catch {}
                              }}
                              title="Rerun"
                            >
                              <Icon name="redo" className="text-[16px] text-muted" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="px-4 py-8 text-muted" colSpan={7}>
                        No runs yet. Run a flow to see execution history.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-panel">
              <div className="text-sm text-muted">
                Showing{" "}
                <span className="font-medium text-text">
                  {filtered.length === 0 ? 0 : pageStartIdx + 1}-{Math.min(pageStartIdx + pageItems.length, filtered.length)}
                </span>{" "}
                of <span className="font-medium text-text">{filtered.length}</span> results
              </div>

              <div className="flex items-center gap-3">
                <select
                  className="h-9 rounded-lg bg-surface border border-border px-3 text-sm text-text focus:outline-none focus:shadow-focus"
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                >
                  <option value={10}>10 per page</option>
                  <option value={20}>20 per page</option>
                  <option value={50}>50 per page</option>
                </select>

                <Pagination page={pageSafe} pageCount={pageCount} onChange={(p) => setPage(p)} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" className="sr-only peer" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <div className="w-10 h-6 bg-surface2 border border-border rounded-full peer peer-checked:bg-accent relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-panel after:border after:border-border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-4" />
    </label>
  );
}

function parseTime(v?: string) {
  if (!v) return undefined;
  const t = new Date(v).getTime();
  return Number.isFinite(t) ? t : undefined;
}

function cutoffFor(tf: "24h" | "7d" | "30d" | "all") {
  const now = Date.now();
  if (tf === "all") return undefined;
  if (tf === "24h") return now - 24 * 60 * 60 * 1000;
  if (tf === "7d") return now - 7 * 24 * 60 * 60 * 1000;
  return now - 30 * 24 * 60 * 60 * 1000;
}

function formatDate(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return "—";
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(d);
}

function formatRelative(iso?: string) {
  const t = parseTime(iso);
  if (!t) return "—";
  const diff = Date.now() - t;
  if (diff < 60_000) return "Just now";
  if (diff < 60 * 60_000) return `${Math.floor(diff / 60_000)} mins ago`;
  if (diff < 24 * 60 * 60_000) return `${Math.floor(diff / (60 * 60_000))} hours ago`;
  return `${Math.floor(diff / (24 * 60 * 60_000))} days ago`;
}

function formatDuration(startedAt?: string, finishedAt?: string) {
  const start = parseTime(startedAt);
  const end = parseTime(finishedAt);
  if (!start || !end) return "—";
  const ms = Math.max(0, end - start);
  if (ms < 1000) return `${ms}ms`;
  const sec = ms / 1000;
  if (sec < 10) return `${sec.toFixed(1)}s`;
  if (sec < 60) return `${Math.round(sec)}s`;
  const min = Math.floor(sec / 60);
  const rem = Math.round(sec % 60);
  return `${min}m ${rem}s`;
}

function shortId(id: string) {
  if (id.length <= 12) return id;
  return `${id.slice(0, 8)}…${id.slice(-4)}`;
}

function Pagination({
  page,
  pageCount,
  onChange,
}: {
  page: number;
  pageCount: number;
  onChange: (p: number) => void;
}) {
  const pages = useMemo(() => {
    const unique = new Set<number>();
    unique.add(1);
    unique.add(pageCount);
    unique.add(page);
    unique.add(page - 1);
    unique.add(page + 1);
    return Array.from(unique)
      .filter((p) => p >= 1 && p <= pageCount)
      .sort((a, b) => a - b);
  }, [page, pageCount]);

  const items: Array<number | "ellipsis"> = [];
  for (let i = 0; i < pages.length; i++) {
    const current = pages[i];
    const prev = pages[i - 1];
    if (i > 0 && current - prev > 1) items.push("ellipsis");
    items.push(current);
  }

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        className="h-9 w-9 rounded-lg border border-border bg-surface hover:bg-surface2 disabled:opacity-50"
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page <= 1}
        aria-label="Previous page"
      >
        <Icon name="chevron_left" className="text-[18px] text-muted mx-auto" />
      </button>
      {items.map((it, idx) =>
        it === "ellipsis" ? (
          <div key={`e-${idx}`} className="h-9 px-2 flex items-center text-sm text-muted">
            …
          </div>
        ) : (
          <button
            key={it}
            type="button"
            className={`h-9 w-9 rounded-lg border text-sm font-medium transition-colors ${
              it === page ? "border-accent bg-surface2 text-text" : "border-border bg-surface text-muted hover:bg-surface2 hover:text-text"
            }`}
            onClick={() => onChange(it)}
            aria-current={it === page ? "page" : undefined}
          >
            {it}
          </button>
        )
      )}
      <button
        type="button"
        className="h-9 w-9 rounded-lg border border-border bg-surface hover:bg-surface2 disabled:opacity-50"
        onClick={() => onChange(Math.min(pageCount, page + 1))}
        disabled={page >= pageCount}
        aria-label="Next page"
      >
        <Icon name="chevron_right" className="text-[18px] text-muted mx-auto" />
      </button>
    </div>
  );
}
