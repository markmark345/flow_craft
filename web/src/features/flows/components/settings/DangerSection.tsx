"use client";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

type Props = {
  resetting: boolean;
  setConfirmResetOpen: (open: boolean) => void;
  onClearLocalCache: () => void;
};

export function DangerSection({ resetting, setConfirmResetOpen, onClearLocalCache }: Props) {
  return (
    <section className="bg-panel border border-red rounded-xl shadow-soft overflow-hidden">
      <div
        className="px-6 py-5 border-b border-red"
        style={{ background: "color-mix(in srgb, var(--error) 10%, transparent)" }}
      >
        <h3 className="text-lg font-semibold text-red flex items-center gap-2">
          <Icon name="warning" className="text-[20px]" />
          Danger Zone
        </h3>
      </div>
      <div className="p-6 space-y-4">
        <p className="text-sm text-muted">
          Irreversible actions. Please proceed with caution. These actions may affect all active workflows in
          this workspace.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 pt-2">
          <Button
            variant="secondary"
            size="md"
            className="rounded-lg border-red text-red"
            onClick={() => setConfirmResetOpen(true)}
            disabled={resetting}
          >
            {resetting ? "Resetting..." : "Reset workspace"}
          </Button>
          <Button variant="secondary" size="md" className="rounded-lg" onClick={onClearLocalCache}>
            Clear local cache
          </Button>
        </div>
      </div>
    </section>
  );
}
