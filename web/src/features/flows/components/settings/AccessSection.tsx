"use client";

import { Button } from "@/components/ui/button";

type Props = {
  navigateTo: (path: string) => void;
};

export function AccessSection({ navigateTo }: Props) {
  return (
    <>
      <section className="bg-panel border border-border rounded-xl shadow-soft overflow-hidden">
        <div className="px-6 py-5 border-b border-border">
          <h3 className="text-lg font-semibold text-text">Credentials</h3>
        </div>
        <div className="p-6 flex items-center justify-between gap-6">
          <div>
            <div className="text-sm font-medium text-muted">Connect apps</div>
            <div className="text-xs text-muted">Use Gmail, Sheets, and GitHub in your workflows.</div>
          </div>
          <Button size="md" className="rounded-lg" onClick={() => navigateTo("/settings/credentials")}>
            Manage credentials
          </Button>
        </div>
      </section>

      <section className="bg-panel border border-border rounded-xl shadow-soft overflow-hidden">
        <div className="px-6 py-5 border-b border-border">
          <h3 className="text-lg font-semibold text-text">Variables</h3>
        </div>
        <div className="p-6 flex items-center justify-between gap-6">
          <div>
            <div className="text-sm font-medium text-muted">Reusable values</div>
            <div className="text-xs text-muted">Store keys and values for your personal workflows.</div>
          </div>
          <Button size="md" className="rounded-lg" onClick={() => navigateTo("/settings/variables")}>
            Manage variables
          </Button>
        </div>
      </section>
    </>
  );
}
