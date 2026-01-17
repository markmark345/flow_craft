"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { RunDTO, FlowDTO } from "@/types/dto";

type Props = {
  run: RunDTO;
  flow: FlowDTO | undefined;
  logQuery: string;
  setLogQuery: (val: string) => void;
  canceling: boolean;
  cancelable: boolean;
  running: boolean;
  runningFlowId: string | undefined;
  refreshAll: () => void;
  onCancel: () => void;
  onRerun: () => void;
  getTone: (status: RunDTO["status"]) => "default" | "success" | "warning" | "danger";
  formatDate: (iso?: string) => string;
  formatDuration: (start?: string, end?: string) => string;
  shortId: (id: string) => string;
  runLoading: boolean;
  stepsLoading: boolean;
};

export function RunHeader({
  run,
  flow,
  logQuery,
  setLogQuery,
  canceling,
  cancelable,
  running,
  runningFlowId,
  refreshAll,
  onCancel,
  onRerun,
  getTone,
  formatDate,
  formatDuration,
  shortId,
  runLoading,
  stepsLoading,
}: Props) {
  return (
    <header className="sticky top-0 z-10 bg-panel border-b border-border px-8 py-4">
      <div className="max-w-[1400px] mx-auto flex flex-col gap-3">
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-sm text-muted min-w-0">
            <Link href="/flows" className="hover:text-text">
              Flows
            </Link>
            <span>/</span>
            <Link href={`/flows/${run.flowId}/builder`} className="hover:text-text truncate">
              {flow?.name || shortId(run.flowId)}
            </Link>
            <span>/</span>
            <span className="text-text font-medium truncate">Run {shortId(run.id)}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative hidden md:block w-[280px]">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon name="search" className="text-[18px] text-muted" />
              </div>
              <Input
                value={logQuery}
                onChange={(e) => setLogQuery(e.target.value)}
                placeholder="Search execution logs..."
                className="h-9 pl-10 rounded-lg bg-surface2"
              />
            </div>
            <div className="size-9 rounded-full bg-surface2 border border-border" />
          </div>
        </div>

        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-text truncate">
                {flow?.name || "Workflow Run"}
              </h1>
              <Badge label={run.status} tone={getTone(run.status)} />
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-muted">
              <span className="inline-flex items-center gap-2">
                <Icon name="schedule" className="text-[16px] text-muted" />
                Started {formatDate(run.startedAt || run.createdAt)}
              </span>
              <span className="inline-flex items-center gap-2">
                <Icon name="history" className="text-[16px] text-muted" />
                Duration {formatDuration(run.startedAt, run.finishedAt)}
              </span>
              <span className="inline-flex items-center gap-2">
                <Icon name="data_object" className="text-[16px] text-muted" />
                Triggered by API
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              className="h-9 px-4 rounded-lg"
              onClick={onCancel}
              disabled={!cancelable || canceling}
            >
              <Icon name="close" className="text-[18px] mr-2" />
              {canceling ? "Canceling..." : "Cancel Run"}
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="h-9 px-4 rounded-lg"
              onClick={onRerun}
              disabled={running && runningFlowId === run.flowId}
            >
              <Icon name="redo" className="text-[18px] mr-2" />
              Rerun Flow
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="h-9 px-4 rounded-lg"
              onClick={refreshAll}
              disabled={runLoading || stepsLoading}
            >
              <Icon name="refresh" className="text-[18px] mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
