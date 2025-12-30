"use client";

import { Button } from "@/shared/components/button";
import { Icon } from "@/shared/components/icon";

type Props = {
  isAdmin: boolean;
  onDeleteRequest: () => void;
};

export function ProjectDangerZoneCard({ isAdmin, onDeleteRequest }: Props) {
  return (
    <section className="bg-panel border border-[color-mix(in_srgb,var(--error)_35%,var(--border))] rounded-xl shadow-soft overflow-hidden">
      <div
        className="px-6 py-5 border-b border-[color-mix(in_srgb,var(--error)_35%,var(--border))]"
        style={{ background: "color-mix(in srgb, var(--error) 10%, transparent)" }}
      >
        <h2 className="text-lg font-semibold text-red">Danger Zone</h2>
      </div>
      <div className="p-6 space-y-4">
        <p className="text-sm text-text">
          Deleting a project is irreversible. You can also choose to move all workflows and credentials to another
          project before deletion.
        </p>
        <div className="flex items-start gap-2 text-xs text-muted">
          <Icon name="info" className="text-[14px]" />
          <span>All active workflows will be stopped immediately.</span>
        </div>
        <Button
          variant="ghost"
          onClick={onDeleteRequest}
          disabled={!isAdmin}
          className="w-full border border-[color-mix(in_srgb,var(--error)_35%,transparent)] text-red hover:bg-[color-mix(in_srgb,var(--error)_8%,transparent)]"
        >
          Delete this project
        </Button>
      </div>
    </section>
  );
}

