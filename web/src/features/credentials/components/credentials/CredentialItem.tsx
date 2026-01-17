"use client";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

type Props = {
  item: any; // Using any for now to simplify, but ideally should be CredentialDTO
  isAdmin: boolean;
  onDisconnect: (id: string) => void;
  formatDate: (val?: string) => string;
};

export function CredentialItem({ item, isAdmin, onDisconnect, formatDate }: Props) {
  return (
    <div key={item.id} className="py-4 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-4 min-w-0">
        <div className="h-10 w-10 rounded-xl bg-surface2 border border-border flex items-center justify-center">
          <Icon name={item.provider === "github" ? "github" : "google"} className="text-[18px]" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-text">{item.name}</div>
          <div className="text-xs text-muted">
            {item.provider.toUpperCase()} · Updated {formatDate(item.updatedAt)} · Created{" "}
            {formatDate(item.createdAt)}
          </div>
          <div className="text-xs text-muted truncate max-w-[420px]">
            {item.accountEmail ? item.accountEmail : "Connected account"}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="px-2 py-1 rounded-md border border-border bg-surface2 text-xs text-muted">
          {item.scope === "project" ? "Project" : "Personal"}
        </span>
        <Button
          variant="secondary"
          className="rounded-lg border-red text-red"
          onClick={() => onDisconnect(item.id)}
          disabled={!isAdmin}
        >
          Disconnect
        </Button>
      </div>
    </div>
  );
}
