"use client";

import { ReactNode, useEffect } from "react";
import { Button } from "./button";
import { Icon } from "@/shared/components/icon";

type Props = {
  open: boolean;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: "primary" | "danger" | "secondary";
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmVariant = "primary",
  loading,
  onConfirm,
  onClose,
}: Props) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-panel border border-border rounded-xl shadow-lift w-full max-w-md p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-text">{title}</h3>
            {description ? <div className="text-sm text-muted mt-1">{description}</div> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:text-text transition-colors p-1 rounded-md hover:bg-surface2"
            aria-label="Close"
          >
            <Icon name="close" className="text-[18px]" />
          </button>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={confirmVariant} onClick={onConfirm} disabled={loading}>
            {loading ? "Working..." : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
