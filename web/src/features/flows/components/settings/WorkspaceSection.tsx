"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconButton } from "@/components/ui/icon-button";
import { Label } from "@/components/ui/label";

type Props = {
  workspaceName: string;
  workspaceId: string;
  setWorkspaceNameDraft: (val: string) => void;
  copyWorkspaceId: () => void;
  saveWorkspace: () => void;
};

export function WorkspaceSection({
  workspaceName,
  workspaceId,
  setWorkspaceNameDraft,
  copyWorkspaceId,
  saveWorkspace,
}: Props) {
  return (
    <section className="bg-panel border border-border rounded-xl shadow-soft overflow-hidden">
      <div className="px-6 py-5 border-b border-border">
        <h3 className="text-lg font-semibold text-text">Workspace</h3>
      </div>
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Workspace name</Label>
          <Input
            value={workspaceName}
            onChange={(e) => setWorkspaceNameDraft(e.target.value)}
            className="h-10 rounded-lg bg-surface2"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Workspace ID</Label>
          <div className="flex rounded-lg shadow-soft">
            <div className="relative flex-grow">
              <Input
                value={workspaceId}
                readOnly
                className="h-10 rounded-l-lg rounded-r-none bg-surface2 font-mono text-muted"
              />
            </div>
            <IconButton
              icon="content_copy"
              className="rounded-l-none rounded-r-lg border border-l-0 border-border bg-surface2 h-10 w-10"
              onClick={copyWorkspaceId}
              title="Copy"
            />
          </div>
          <p className="text-xs text-muted">
            Used for API authentication and CLI configuration.
          </p>
        </div>

        <div className="flex justify-end pt-2">
          <Button size="md" className="rounded-lg" onClick={saveWorkspace}>
            Save changes
          </Button>
        </div>
      </div>
    </section>
  );
}
