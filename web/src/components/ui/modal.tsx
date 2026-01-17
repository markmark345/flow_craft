import { ReactNode } from "react";
import { Button } from "./button";
import { IconButton } from "./icon-button";

export function Modal({ title, body, open, onClose }: { title: string; body: ReactNode; open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50">
      <div className="bg-panel border border-border rounded-lg shadow-lift w-[400px] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">{title}</h3>
          <IconButton icon="close" onClick={onClose} size="sm" className="text-muted" />
        </div>
        <div className="text-sm text-muted">{body}</div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}
