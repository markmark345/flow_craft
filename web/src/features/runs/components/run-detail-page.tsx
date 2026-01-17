"use client";

import { useRunDetailPage } from "../hooks/use-run-detail-page";
import { RunHeader } from "./run-detail/RunHeader";
import { ExecutionTimeline } from "./run-detail/ExecutionTimeline";
import { StepDetail } from "./run-detail/StepDetail";
import { formatDate, formatDuration, shortId } from "../lib/run-utils";

type Props = { runId: string };

export function RunDetailPage({ runId }: Props) {
  const {
    run,
    flow,
    steps,
    selectedStep,
    runLoading,
    stepsLoading,
    runError,
    stepsError,
    canceling,
    running,
    runningFlowId,
    activeTab,
    logQuery,
    cancelable,
    setActiveTab,
    setSelectedStepId,
    setLogQuery,
    refreshAll,
    reloadSteps,
    onCancel,
    onRerun,
    getTone,
    getTabText,
    filterLogText,
    showSuccess,
    showError,
    showInfo,
  } = useRunDetailPage(runId);

  if (runLoading && !run) return <p className="text-muted">Loading run…</p>;
  if (!run) return <p className="text-muted">{runError ? runError : "Run not found"}</p>;

  return (
    <div className="min-h-screen bg-bg">
      <RunHeader
        run={run}
        flow={flow}
        logQuery={logQuery}
        setLogQuery={setLogQuery}
        canceling={canceling}
        cancelable={cancelable}
        running={running}
        runningFlowId={runningFlowId}
        refreshAll={refreshAll}
        onCancel={onCancel}
        onRerun={onRerun}
        getTone={getTone}
        formatDate={formatDate}
        formatDuration={formatDuration}
        shortId={shortId}
        runLoading={runLoading}
        stepsLoading={stepsLoading}
      />

      <div className="p-8">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <ExecutionTimeline
            steps={steps}
            selectedStep={selectedStep}
            stepsLoading={stepsLoading}
            stepsError={stepsError}
            setSelectedStepId={setSelectedStepId}
            reloadSteps={reloadSteps}
          />

          <StepDetail
            selectedStep={selectedStep}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            getTabText={getTabText}
            filterLogText={filterLogText}
            showInfo={showInfo}
            showSuccess={showSuccess}
            showError={showError}
          />
        </div>
      </div>
    </div>
  );
}
