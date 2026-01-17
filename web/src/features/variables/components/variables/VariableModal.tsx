"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type Props = {
  open: boolean;
  title: string;
  keyValue: string;
  value: string;
  saving: boolean;
  onKeyChange: (value: string) => void;
  onValueChange: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
};

export function VariableModal({
  open,
  title,
  keyValue,
  value,
  saving,
  onKeyChange,
  onValueChange,
  onClose,
  onSave,
}: Props) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-panel border border-border shadow-lift overflow-hidden"
        onClick={(event) => event.stopPropagation()}
      >
        <IconButton
          icon="close"
          onClick={onClose}
          className="absolute right-4 top-4 text-muted hover:text-text transition-colors rounded-full p-1 h-auto w-auto"
          aria-label="Close"
        />

        <div className="px-8 pt-8 pb-2">
          <h2 className="text-xl font-bold text-text">{title}</h2>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (!saving) onSave();
          }}
        >
          <div className="px-8 py-4 space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="variable-key" className="font-semibold text-muted">
                Key
              </Label>
              <Input
                id="variable-key"
                value={keyValue}
                onChange={(event) => onKeyChange(event.target.value)}
                className="h-11 rounded-lg"
                autoFocus
                disabled={saving}
                placeholder="Enter a name"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="variable-value" className="font-semibold text-muted">
                Value
              </Label>
              <Textarea
                id="variable-value"
                value={value}
                onChange={(event) => onValueChange(event.target.value)}
                className="min-h-[120px]"
                disabled={saving}
                placeholder="Enter a value"
              />
            </div>
          </div>

          <div className="px-8 pt-4 pb-8 flex items-center justify-end gap-3">
            <Button
              variant="link"
              className="text-sm font-medium text-muted hover:text-text transition-colors p-0 h-auto no-underline hover:no-underline"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="rounded-lg px-6">
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
