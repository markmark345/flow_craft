"use client";

import { Button } from "@/components/ui/button";
import { RunStepDTO } from "@/types/dto";
import { stepStatusIcon, formatDuration } from "../../lib/run-utils";

type Props = {
  steps: RunStepDTO[];
  selectedStep: RunStepDTO | undefined;
  stepsLoading: boolean;
  stepsError: string | undefined;
  setSelectedStepId: (id: string) => void;
  reloadSteps: () => void;
};

export function ExecutionTimeline({
  steps,
  selectedStep,
  stepsLoading,
  stepsError,
  setSelectedStepId,
  reloadSteps,
}: Props) {
  return (
    <aside className="lg:col-span-3">
      <div className="bg-panel border border-border rounded-xl shadow-soft overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <div className="text-xs font-semibold text-muted uppercase tracking-wide">Execution Timeline</div>
        </div>
        <div className="p-2 max-h-[60vh] overflow-auto">
          {stepsError && steps.length === 0 ? (
            <div className="p-3 text-sm text-muted flex items-center justify-between gap-3">
              <div>Failed to load steps.</div>
              <Button
                variant="link"
                size="sm"
                className="text-accent font-medium hover:underline p-0 h-auto"
                onClick={reloadSteps}
              >
                Retry
              </Button>
            </div>
          ) : null}

          {stepsLoading && steps.length === 0 ? (
            <div className="p-3 text-sm text-muted">Loading steps…</div>
          ) : steps.length ? (
            <div className="flex flex-col">
              {steps.map((step) => {
                const active = step.id === selectedStep?.id;
                return (
                  <Button
                    key={step.id}
                    variant="ghost"
                    onClick={() => setSelectedStepId(step.id)}
                    className={`w-full justify-start h-auto px-3 py-2 rounded-lg font-normal transition-colors ${
                      active ? "bg-surface2" : "hover:bg-surface2"
                    }`}
                  >
                    <div className="flex items-start gap-3 w-full">
                      <span className="mt-0.5">{stepStatusIcon(step.status)}</span>
                      <div className="min-w-0 flex-1 text-left">
                        <div className="text-sm font-medium text-text truncate">{step.name}</div>
                        <div className="text-xs text-muted flex items-center justify-between gap-2">
                          <span className="truncate">{step.error ? step.error : step.status}</span>
                          <span className="shrink-0">{formatDuration(step.startedAt, step.finishedAt)}</span>
                        </div>
                      </div>
                    </div>
                  </Button>
                );
              })}
            </div>
          ) : (
            <div className="p-3 text-sm text-muted">No steps yet.</div>
          )}
        </div>
      </div>
    </aside>
  );
}
