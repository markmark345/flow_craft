"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";
import { Icon } from "@/components/ui/icon";
import { FlowDTO, RunDTO } from "@/types/dto";

type RunStatus = "all" | "queued" | "running" | "success" | "failed" | "canceled";
type Timeframe = "24h" | "7d" | "30d" | "all";

type Props = {
  query: string;
  setQuery: (v: string) => void;
  status: string;
  setStatus: (v: RunStatus) => void;
  timeframe: string;
  setTimeframe: (v: Timeframe) => void;
  flowId: string;
  setFlowId: (v: string) => void;
  autoRefresh: boolean;
  setAutoRefresh: (v: boolean) => void;
  filteredCount: number;
  pageStartIdx: number;
  pageItemCount: number;
  exportLogs: () => void;
  refreshAll: () => void;
  runningAny: boolean;
  flows: FlowDTO[];
};

export function RunsHeader({
  query,
  setQuery,
  status,
  setStatus,
  timeframe,
  setTimeframe,
  flowId,
  setFlowId,
  autoRefresh,
  setAutoRefresh,
  filteredCount,
  pageStartIdx,
  pageItemCount,
  exportLogs,
  refreshAll,
  runningAny,
  flows,
}: Props) {
  return (
    <header className="sticky top-0 z-10 bg-panel border-b border-border px-8 py-6">
      <div className="max-w-[1400px] mx-auto flex flex-col gap-4">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text">Run History</h1>
            <p className="text-sm text-muted">
              Showing{" "}
              <span className="font-medium text-text">
                {filteredCount === 0 ? 0 : pageStartIdx + 1}-{Math.min(pageStartIdx + pageItemCount, filteredCount)}
              </span>{" "}
              of <span className="font-medium text-text">{filteredCount}</span> executions
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              className="h-9 px-4 rounded-lg"
              onClick={exportLogs}
              disabled={filteredCount === 0}
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
            <Select
              className="w-32"
              value={status}
              onChange={(v) => setStatus(v as any)}
              options={[
                { value: "all", label: "Status: All" },
                { value: "queued", label: "Queued" },
                { value: "running", label: "Running" },
                { value: "success", label: "Success" },
                { value: "failed", label: "Failed" },
                { value: "canceled", label: "Canceled" },
              ]}
            />

            <Select
              className="w-40"
              value={timeframe}
              onChange={(v) => setTimeframe(v as any)}
              options={[
                { value: "24h", label: "Last 24h" },
                { value: "7d", label: "Last 7 days" },
                { value: "30d", label: "Last 30 days" },
                { value: "all", label: "All time" },
              ]}
            />

            <Select
              className="w-48"
              value={flowId}
              onChange={(v) => setFlowId(v)}
              searchable
              searchPlaceholder="Search flows..."
              options={[
                { value: "all", label: "Flow: All Flows" },
                ...flows.map((f) => ({ value: f.id, label: f.name })),
              ]}
            />

            <div className="ml-auto flex items-center gap-2">
              <span className="text-sm text-muted">Auto-refresh</span>
              <Toggle checked={autoRefresh} onChange={setAutoRefresh} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
