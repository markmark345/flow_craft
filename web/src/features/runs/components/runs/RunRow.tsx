"use client";

import { Badge } from "@/components/ui/badge";
import { IconButton } from "@/components/ui/icon-button";
import { Icon } from "@/components/ui/icon";
import { RunDTO } from "@/types/dto";
import { shortId, formatDate, formatRelative, formatDuration } from "../../lib/run-utils";

type Props = {
  run: RunDTO;
  flowName: string;
  running: boolean;
  runningFlowId?: string;
  getTone: (status: RunDTO["status"]) => any;
  navigateToRun: (id: string) => void;
  startRunForFlow: (flowId: string) => Promise<void>;
};

export function RunRow({
  run,
  flowName,
  running,
  runningFlowId,
  getTone,
  navigateToRun,
  startRunForFlow,
}: Props) {
  return (
    <tr
      key={run.id}
      className="hover:bg-surface2 transition-colors cursor-pointer"
      onClick={() => navigateToRun(run.id)}
    >
      <td className="px-4 py-3">
        <Badge label={run.status} tone={getTone(run.status)} />
      </td>
      <td className="px-4 py-3 font-medium text-text">{flowName}</td>
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
          <IconButton
            icon="open_in_full"
            className="h-8 w-8 text-muted hover:text-text"
            onClick={(e) => {
              e.stopPropagation();
              navigateToRun(run.id);
            }}
            title="View run"
          />
          <IconButton
            icon="redo"
            className="h-8 w-8 text-muted hover:text-text disabled:opacity-60"
            disabled={running && runningFlowId === run.flowId}
            onClick={async (e) => {
              e.stopPropagation();
              try {
                await startRunForFlow(run.flowId);
              } catch {}
            }}
            title="Rerun"
          />
        </div>
      </td>
    </tr>
  );
}
