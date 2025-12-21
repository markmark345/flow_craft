"use client";

import { Badge } from "@/shared/components/badge";
import { Button } from "@/shared/components/button";
import { useRunDetailQuery } from "../hooks/use-run-detail";
import { RunDTO, RunStepDTO } from "@/shared/types/dto";
import { useRunStepsQuery } from "../hooks/use-run-steps";
import { useCancelRun } from "../hooks/use-cancel-run";
import { useRunFlow } from "../hooks/use-run-flow";
import { Icon } from "@/shared/components/icon";
import { Tabs } from "@/shared/components/tabs";
import { Input } from "@/shared/components/input";
import Link from "next/link";
import { useFlowDetailQuery } from "@/features/flows/hooks/use-flow-detail";
import { useAppStore } from "@/shared/hooks/use-app-store";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type Props = { runId: string };

export function RunDetailPage({ runId }: Props) {
  const router = useRouter();
  const { run, loading: runLoading, error: runError, reload: reloadRun } = useRunDetailQuery(runId, { pollMs: 2000 });
  const { steps, loading: stepsLoading, error: stepsError, reload: reloadSteps } = useRunStepsQuery(runId, { pollMs: 2000 });
  const { cancel, canceling } = useCancelRun();
  const { startRun, running, runningFlowId } = useRunFlow();
  const { flow } = useFlowDetailQuery(run?.flowId);
  const showSuccess = useAppStore((s) => s.showSuccess);
  const showError = useAppStore((s) => s.showError);
  const showInfo = useAppStore((s) => s.showInfo);

  const [activeTab, setActiveTab] = useState<"inputs" | "outputs" | "logs" | "errors">("outputs");
  const [selectedStepId, setSelectedStepId] = useState<string | undefined>(undefined);
  const [logQuery, setLogQuery] = useState("");

  const tone = (s: RunDTO["status"]): "default" | "success" | "warning" | "danger" => {
    if (s === "success") return "success";
    if (s === "failed") return "danger";
    if (s === "running" || s === "queued") return "warning";
    return "default";
  };

  useEffect(() => {
    if (!steps.length) return;
    if (selectedStepId && steps.some((s) => s.id === selectedStepId)) return;
    setSelectedStepId(steps[0].id);
  }, [selectedStepId, steps]);

  const selectedStep = useMemo<RunStepDTO | undefined>(() => {
    if (!steps.length) return undefined;
    return steps.find((s) => s.id === selectedStepId) || steps[0];
  }, [selectedStepId, steps]);

  const refreshAll = async () => {
    await Promise.all([reloadRun(), reloadSteps()]);
  };

  const cancelable = run?.status === "queued" || run?.status === "running";

  const onCancel = async () => {
    if (!run) return;
    try {
      await cancel(run.id);
      await refreshAll();
    } catch {}
  };

  const onRerun = async () => {
    if (!run) return;
    try {
      const created = await startRun(run.flowId);
      showSuccess("Run started", "Redirecting to run detail…");
      router.push(`/runs/${created.id}`);
    } catch {}
  };

  if (runLoading && !run) return <p className="text-muted">Loading run…</p>;
  if (!run) return <p className="text-muted">{runError ? runError : "Run not found"}</p>;

  return (
    <div className="min-h-screen bg-bg">
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
                <Badge label={run.status} tone={tone(run.status)} />
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
              <Button variant="secondary" size="sm" className="h-9 px-4 rounded-lg" onClick={refreshAll} disabled={runLoading || stepsLoading}>
                <Icon name="refresh" className="text-[18px] mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="p-8">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <aside className="lg:col-span-3">
            <div className="bg-panel border border-border rounded-xl shadow-soft overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <div className="text-xs font-semibold text-muted uppercase tracking-wide">Execution Timeline</div>
              </div>
              <div className="p-2 max-h-[60vh] overflow-auto">
                {stepsError && steps.length === 0 ? (
                  <div className="p-3 text-sm text-muted flex items-center justify-between gap-3">
                    <div>Failed to load steps.</div>
                    <button type="button" className="text-accent text-sm font-medium hover:underline" onClick={reloadSteps}>
                      Retry
                    </button>
                  </div>
                ) : null}

                {stepsLoading && steps.length === 0 ? (
                  <div className="p-3 text-sm text-muted">Loading steps…</div>
                ) : steps.length ? (
                  <div className="flex flex-col">
                    {steps.map((step) => {
                      const active = step.id === selectedStep?.id;
                      return (
                        <button
                          key={step.id}
                          type="button"
                          onClick={() => setSelectedStepId(step.id)}
                          className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                            active ? "bg-surface2" : "hover:bg-surface2"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <span className="mt-0.5">{stepStatusIcon(step.status)}</span>
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-medium text-text truncate">{step.name}</div>
                              <div className="text-xs text-muted flex items-center justify-between gap-2">
                                <span className="truncate">{step.error ? step.error : step.status}</span>
                                <span className="shrink-0">{formatDuration(step.startedAt, step.finishedAt)}</span>
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-3 text-sm text-muted">No steps yet.</div>
                )}
              </div>
            </div>
          </aside>

          <section className="lg:col-span-9">
            <div className="bg-panel border border-border rounded-xl shadow-soft overflow-hidden">
              <div className="px-6 py-4 border-b border-border flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-xs text-muted font-mono">{selectedStep ? selectedStep.stepKey : "—"}</div>
                  <div className="text-lg font-semibold text-text truncate">{selectedStep?.name || "Select a step"}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="h-9 w-9 rounded-lg border border-border bg-surface hover:bg-surface2 flex items-center justify-center"
                    onClick={() => showInfo("Help", "Step detail help is coming soon.")}
                    title="Help"
                  >
                    <Icon name="help" className="text-[18px] text-muted" />
                  </button>
                  <button
                    type="button"
                    className="h-9 w-9 rounded-lg border border-border bg-surface hover:bg-surface2 flex items-center justify-center"
                    onClick={async () => {
                      const text = tabText(selectedStep, activeTab, run.log);
                      if (!text) return;
                      try {
                        await navigator.clipboard.writeText(text);
                        showSuccess("Copied", "Copied to clipboard.");
                      } catch (err: any) {
                        showError("Copy failed", err?.message || "Unable to copy");
                      }
                    }}
                    disabled={!selectedStep}
                    title="Copy"
                  >
                    <Icon name="content_copy" className="text-[18px] text-muted" />
                  </button>
                </div>
              </div>

              <Tabs
                tabs={[
                  { id: "inputs", label: "Inputs" },
                  { id: "outputs", label: "Outputs" },
                  { id: "logs", label: "Logs" },
                  { id: "errors", label: "Errors" },
                ]}
                activeId={activeTab}
                onChange={(id) => setActiveTab(id as any)}
                className="px-6"
              />

              <div className="p-6">
                {selectedStep ? (
                  <>
                    {activeTab === "outputs" && selectedStep.finishedAt ? (
                      <div className="text-xs text-muted mb-2">
                        Output generated at {formatDate(selectedStep.finishedAt)}
                      </div>
                    ) : null}

                    <pre className="text-xs whitespace-pre break-words rounded-xl bg-surface2 border border-border p-4 font-mono text-text overflow-auto max-h-[60vh]">
                      {filterLogText(tabText(selectedStep, activeTab, run.log), logQuery) || "—"}
                    </pre>
                  </>
                ) : (
                  <div className="text-sm text-muted">Select a step from the timeline to view details.</div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function stepStatusIcon(status: RunStepDTO["status"]) {
  if (status === "success") return <Icon name="check_circle" className="text-[18px] text-green" />;
  if (status === "failed") return <Icon name="error" className="text-[18px] text-red" />;
  if (status === "running") return <Icon name="refresh" className="text-[18px] text-warning" />;
  if (status === "canceled") return <Icon name="close" className="text-[18px] text-muted" />;
  if (status === "skipped") return <Icon name="remove" className="text-[18px] text-muted" />;
  return <span className="size-4 rounded-full border border-border bg-surface inline-block" />;
}

function parseTime(v?: string) {
  if (!v) return undefined;
  const t = new Date(v).getTime();
  return Number.isFinite(t) ? t : undefined;
}

function formatDate(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return "—";
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(d);
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

function tabText(step: RunStepDTO | undefined, tab: "inputs" | "outputs" | "logs" | "errors", runLog?: string) {
  if (!step) return "";
  if (tab === "inputs") return pretty(step.inputs);
  if (tab === "outputs") return pretty(step.outputs);
  if (tab === "logs") return [step.log, runLog].filter(Boolean).join("\n");
  return step.error || (step.status === "failed" ? "Step failed" : "");
}

function pretty(v: unknown) {
  if (v === undefined || v === null) return "";
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return String(v);
  }
}

function filterLogText(text: string, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return text;
  const lines = text.split("\n");
  const filtered = lines.filter((l) => l.toLowerCase().includes(q));
  return filtered.join("\n");
}
