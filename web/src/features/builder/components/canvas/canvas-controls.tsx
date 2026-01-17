import React from "react";
import { IconButton } from "@/shared/components/icon-button";
import { cn } from "@/shared/lib/cn";

type CanvasControlsProps = {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  className?: string;
};

export function CanvasControls({ onZoomIn, onZoomOut, onFitView, className }: CanvasControlsProps) {
  return (
    <div className={cn("absolute bottom-6 left-6 flex flex-col gap-3 z-30", className)}>
      <div className="bg-panel rounded-lg shadow-lift border border-border flex flex-col overflow-hidden">
        <IconButton
          icon="add"
          title="Zoom in"
          onClick={onZoomIn}
          variant="ghost"
          size="lg"
          className="rounded-none border-b border-border active:bg-surface2"
        />
        <IconButton
          icon="remove"
          title="Zoom out"
          onClick={onZoomOut}
          variant="ghost"
          size="lg"
          className="rounded-none active:bg-surface2"
        />
      </div>
      <div className="bg-panel rounded-lg shadow-lift border border-border">
        <IconButton
          icon="center_focus_strong"
          title="Fit to screen"
          onClick={onFitView}
          variant="ghost"
          size="lg"
          className="active:bg-surface2"
        />
      </div>
    </div>
  );
}

