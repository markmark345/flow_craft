"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RunDTO } from "@/types/dto";
import { RunRow } from "./RunRow";

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
      <Table className="min-w-[1100px] w-full text-sm">
          <TableHeader className="bg-surface2">
            <TableRow className="border-border hover:bg-surface2">
              <TableHead className="text-left font-semibold px-4 py-3 text-muted text-xs uppercase tracking-wider h-auto">Status</TableHead>
              <TableHead className="text-left font-semibold px-4 py-3 text-muted text-xs uppercase tracking-wider h-auto">Flow Name</TableHead>
              <TableHead className="text-left font-semibold px-4 py-3 text-muted text-xs uppercase tracking-wider h-auto">Run ID</TableHead>
              <TableHead className="text-left font-semibold px-4 py-3 text-muted text-xs uppercase tracking-wider h-auto">Trigger</TableHead>
              <TableHead className="text-left font-semibold px-4 py-3 text-muted text-xs uppercase tracking-wider h-auto">Start Time</TableHead>
              <TableHead className="text-left font-semibold px-4 py-3 text-muted text-xs uppercase tracking-wider h-auto">Duration</TableHead>
              <TableHead className="text-left font-semibold px-4 py-3 text-muted text-xs uppercase tracking-wider h-auto">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {runsLoading && filteredCount === 0 ? (
              <TableRow className="hover:bg-transparent border-transparent">
                <TableCell className="px-4 py-6 text-muted" colSpan={7}>
                  Loading...
                </TableCell>
              </TableRow>
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
              <TableRow className="hover:bg-transparent border-transparent">
                <TableCell className="px-4 py-8 text-muted" colSpan={7}>
                  No runs yet. Run a flow to see execution history.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
      </Table>
    </div>
  );
}
