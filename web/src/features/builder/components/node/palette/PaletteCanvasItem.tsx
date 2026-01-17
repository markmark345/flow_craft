"use client";

import { Icon } from "@/components/ui/icon";

type Props = {
  label: string;
  description: string;
  accentColor: string;
  onDragStart: (e: React.DragEvent) => void;
};

export function PaletteCanvasItem({ label, description, accentColor, onDragStart }: Props) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      className="flex items-center gap-3 p-2 rounded-lg bg-surface hover:bg-surface2 cursor-grab active:cursor-grabbing border border-border hover:shadow-soft transition-all group select-none"
      style={{
        borderColor: "color-mix(in srgb, var(--border) 70%, transparent)",
      }}
    >
      <div
        className="w-8 h-8 rounded-md flex items-center justify-center shrink-0 border"
        style={{
          color: accentColor,
          background: `color-mix(in srgb, ${accentColor} 14%, transparent)`,
          borderColor: `color-mix(in srgb, ${accentColor} 24%, transparent)`,
        }}
      >
        <Icon name="sticky_note" className="text-[18px]" />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-sm font-semibold text-text group-hover:text-text">{label}</span>
        <span className="text-[10px] text-muted truncate">{description}</span>
      </div>
    </div>
  );
}
