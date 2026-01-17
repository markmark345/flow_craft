"use client";

import { RunRow } from "./RunRow";
import { RunDTO } from "@/types/dto";

type Props = {
  runsLoading: boolean;
  filteredCount: number;
  pageItems: RunDTO[];
  flowsById: Map<string, string>;
  running: boolean;
  runningFlowId?: string;
  getTone: (status: RunDTO["status"]) => any;
  navigateToRun: (id: string) => void;
  startRunForFlow: (flowId: string) => Promise<void>;
};

export function RunsTable({
  runsLoading,
  filteredCount,
  pageItems,
  flowsById,
  running,
  runningFlowId,
  getTone,
  navigateToRun,
  startRunForFlow,
}: Props) {
  return (
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
            {runsLoading && filteredCount === 0 ? (
              <tr>
                <td className="px-4 py-6 text-muted" colSpan={7}>
                  Loading...
                </td>
              </tr>
            ) : pageItems.length ? (
              pageItems.map((run) => (
                <RunRow
                  key={run.id}
                  run={run}
                  flowName={flowsById.get(run.flowId) || "Unknown flow"}
                  running={running}
                  runningFlowId={runningFlowId}
                  getTone={getTone}
                  navigateToRun={navigateToRun}
                  startRunForFlow={startRunForFlow}
                />
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
    </div>
  );
}
