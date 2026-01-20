import { getErrorMessage } from "@/lib/error-utils";
"use client";

import { IconButton } from "@/components/ui/icon-button";
import { Tabs } from "@/components/ui/tabs";
import { RunStepDTO } from "@/types/dto";
import { formatDate } from "../../lib/run-utils";

type TabType = "inputs" | "outputs" | "logs" | "errors";

type Props = {
  selectedStep: RunStepDTO | undefined;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  getTabText: (step: RunStepDTO | undefined, tab: TabType) => string;
  filterLogText: (text: string) => string;
  showInfo: (title: string, msg: string) => void;
  showSuccess: (title: string, msg: string) => void;
  showError: (title: string, msg: string) => void;
};

export function StepDetail({
  selectedStep,
  activeTab,
  setActiveTab,
  getTabText,
  filterLogText,
  showInfo,
  showSuccess,
  showError,
}: Props) {
  return (
    <section className="lg:col-span-9">
      <div className="bg-panel border border-border rounded-xl shadow-soft overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-xs text-muted font-mono">{selectedStep ? selectedStep.stepKey : "—"}</div>
            <div className="text-lg font-semibold text-text truncate">
              {selectedStep?.name || "Select a step"}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <IconButton
              icon="help"
              className="h-9 w-9 rounded-lg border border-border bg-surface hover:bg-surface2 text-muted"
              onClick={() => showInfo("Help", "Step detail help is coming soon.")}
              title="Help"
            />
            <IconButton
              icon="content_copy"
              className="h-9 w-9 rounded-lg border border-border bg-surface hover:bg-surface2 text-muted"
              onClick={async () => {
                const text = getTabText(selectedStep, activeTab);
                if (!text) return;
                try {
                  await navigator.clipboard.writeText(text);
                  showSuccess("Copied", "Copied to clipboard.");
                } catch (err: unknown) {
                  showError("Copy failed", getErrorMessage(err) || "Unable to copy");
                }
              }}
              disabled={!selectedStep}
              title="Copy"
            />
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
                {filterLogText(getTabText(selectedStep, activeTab)) || "—"}
              </pre>
            </>
          ) : (
            <div className="text-sm text-muted">Select a step from the timeline to view details.</div>
          )}
        </div>
      </div>
    </section>
  );
}
