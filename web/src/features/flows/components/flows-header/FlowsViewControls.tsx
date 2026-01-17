"use client";

import { IconButton } from "@/components/ui/icon-button";

interface FlowsViewControlsProps {
  onShowInfo: (title: string, message: string) => void;
  onReload: () => void;
  flowsLoading: boolean;
  runsLoading: boolean;
}

export function FlowsViewControls({
  onShowInfo,
  onReload,
  flowsLoading,
  runsLoading,
}: FlowsViewControlsProps) {
  return (
    <div className="border-l border-border pl-3 ml-1 hidden md:flex items-center gap-1">
      <IconButton
        icon="grid_view"
        className="rounded hover:bg-surface2 text-muted hover:text-text h-[34px] w-[34px]"
        onClick={() => onShowInfo("Grid view", "Grid view is coming soon.")}
        title="Grid view (coming soon)"
      />
      <IconButton
        icon="view_list"
        className="rounded bg-surface2 text-accent h-[34px] w-[34px]"
        title="List view"
      />
      <IconButton
        icon="refresh"
        className="rounded hover:bg-surface2 text-muted hover:text-text h-[34px] w-[34px]"
        onClick={onReload}
        disabled={flowsLoading || runsLoading}
        title="Refresh"
      />
    </div>
  );
}
