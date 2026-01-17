"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

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
          <Label className="text-sm font-medium">Icon and name</Label>
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
          <Label className="text-sm font-medium">Description</Label>
          <Textarea
            value={description}
            onChange={(event) => onDescriptionChange(event.target.value)}
            className="min-h-[96px] bg-surface2"
            placeholder="What is this project about?"
          />
        </div>
        <div className="text-xs text-muted">Only admins can update project settings.</div>
      </div>
    </section>
  );
}

