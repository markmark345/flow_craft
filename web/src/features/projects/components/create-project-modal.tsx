"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconButton } from "@/components/ui/icon-button";
import { Label } from "@/components/ui/label";
import { useCreateProjectModal } from "../hooks/use-create-project-modal";

type Props = {
  open: boolean;
  name: string;
  description: string;
  creating: boolean;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onClose: () => void;
  onCreate: () => void;
};

export function CreateProjectModal({
  open,
  name,
  description,
  creating,
  onNameChange,
  onDescriptionChange,
  onClose,
  onCreate,
}: Props) {
  const { disabled } = useCreateProjectModal(open, name, creating, onClose);

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
          className="absolute right-4 top-4 rounded-full"
          onClick={onClose}
          aria-label="Close"
          size="sm"
        />

        <div className="px-8 pt-8 pb-2">
          <h2 className="text-xl font-bold text-text">Create project</h2>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (!disabled) onCreate();
          }}
        >
          <div className="px-8 py-4 space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="create-project-name" className="text-sm font-semibold">
                Name
              </Label>
              <Input
                id="create-project-name"
                value={name}
                onChange={(event) => onNameChange(event.target.value)}
                className="h-11 rounded-lg"
                autoFocus
                disabled={creating}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="create-project-description" className="text-sm font-semibold">
                Description
              </Label>
              <Input
                id="create-project-description"
                value={description}
                onChange={(event) => onDescriptionChange(event.target.value)}
                className="h-11 rounded-lg"
                disabled={creating}
              />
            </div>
          </div>

          <div className="px-8 pt-4 pb-8 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={disabled} className="rounded-lg px-6">
              {creating ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
