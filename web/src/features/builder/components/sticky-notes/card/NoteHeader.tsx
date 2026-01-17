"use client";

import { Icon } from "@/components/ui/icon";

type Props = {
  innerBorder: string;
  accent: string;
  metaColor: string;
  onStartMove: (e: React.PointerEvent) => void;
};

export function NoteHeader({ innerBorder, accent, metaColor, onStartMove }: Props) {
  return (
    <div
      className="flex items-center justify-between px-4 py-2.5 cursor-grab active:cursor-grabbing select-none border-b"
      style={{ borderColor: innerBorder }}
      title="Drag to move"
      onPointerDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onStartMove(e);
      }}
    >
      <div className="flex items-center gap-2" style={{ color: accent }}>
        <Icon name="sticky_note" className="text-[18px]" />
        <span className="text-[10px] font-bold uppercase tracking-[0.18em]">Note</span>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="w-10 h-1 rounded-full" style={{ background: metaColor }} />
      </div>
      <div className="w-6" />
    </div>
  );
}
