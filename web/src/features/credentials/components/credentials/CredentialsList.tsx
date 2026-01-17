"use client";

import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { CredentialItem } from "./CredentialItem";

type Props = {
  loading: boolean;
  filtered: any[];
  isAdmin: boolean;
  reload: () => void;
  onDisconnect: (id: string) => void;
  formatDate: (val?: string) => string;
};

export function CredentialsList({
  loading,
  filtered,
  isAdmin,
  reload,
  onDisconnect,
  formatDate,
}: Props) {
  return (
    <Panel className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-text">Connected apps</h3>
          <p className="text-sm text-muted">Use these credentials in nodes.</p>
        </div>
        <Button variant="secondary" className="rounded-lg" onClick={reload} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {loading ? (
        <div className="text-sm text-muted">Loading credentials...</div>
      ) : filtered.length === 0 ? (
        <div className="text-sm text-muted">No credentials connected yet.</div>
      ) : (
        <div className="divide-y divide-border">
          {filtered.map((item) => (
            <CredentialItem
              key={item.id}
              item={item}
              isAdmin={isAdmin}
              onDisconnect={onDisconnect}
              formatDate={formatDate}
            />
          ))}
        </div>
      )}
    </Panel>
  );
}
