"use client";

import { Button } from "@/shared/components/button";
import { Input } from "@/shared/components/input";
import { Icon } from "@/shared/components/icon";

type Props = {
  description: string;
  hasChanges: boolean;
  isAdmin: boolean;
  name: string;
  onCancel: () => void;
  onDescriptionChange: (value: string) => void;
  onNameChange: (value: string) => void;
  onSave: () => void;
  saving: boolean;
};

export function ProjectInfoCard({
  description,
  hasChanges,
  isAdmin,
  name,
  onCancel,
  onDescriptionChange,
  onNameChange,
  onSave,
  saving,
}: Props) {
  return (
    <section className="bg-panel border border-border rounded-xl shadow-soft overflow-hidden">
      <div className="px-6 py-5 border-b border-border flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-text">Project Info</h2>
          <p className="text-xs text-muted mt-1">Update project name and description.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={onCancel}
            disabled={!isAdmin || !hasChanges || saving}
            className="rounded-lg"
          >
            Cancel
          </Button>
          <Button size="sm" onClick={onSave} disabled={!isAdmin || !hasChanges || saving} className="rounded-lg">
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-muted">Icon and name</label>
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg border border-border bg-surface2 flex items-center justify-center text-muted">
              <Icon name="grid_view" className="text-[18px]" />
            </div>
            <Input
              value={name}
              onChange={(event) => onNameChange(event.target.value)}
              className="h-10 rounded-lg bg-surface2"
              placeholder="Enter project name"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-muted">Description</label>
          <textarea
            value={description}
            onChange={(event) => onDescriptionChange(event.target.value)}
            className="min-h-[96px] w-full rounded-lg bg-surface2 border border-border px-3 py-2 text-sm text-text placeholder:text-muted focus:outline-none focus:shadow-focus"
            placeholder="What is this project about?"
          />
        </div>
        <div className="text-xs text-muted">Only admins can update project settings.</div>
      </div>
    </section>
  );
}

