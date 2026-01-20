"use client";

import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { VariableItem } from "./VariableItem";
import type { VariableDTO } from "@/types/dto";

type Props = {
  loading: boolean;
  filtered: VariableDTO[];
  isAdmin: boolean;
  openCreate: () => void;
  openEdit: (item: VariableDTO) => void;
  setConfirmDeleteOpen: (open: boolean) => void;
  setSelectedId: (id: string) => void;
  formatDate: (val?: string) => string;
};

export function VariablesList({
  loading,
  filtered,
  isAdmin,
  openCreate,
  openEdit,
  setConfirmDeleteOpen,
  setSelectedId,
  formatDate,
}: Props) {
  return (
    <Panel className="p-6">
      {loading ? (
        <div className="text-sm text-muted">Loading variables...</div>
      ) : filtered.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl p-10 text-center space-y-3">
          <div className="text-3xl">👋</div>
          <div className="text-base font-semibold text-text">Let&apos;s set up a variable</div>
          <div className="text-sm text-muted">
            Store values once and reuse them across multiple workflows.
          </div>
          <Button className="rounded-lg" onClick={openCreate} disabled={!isAdmin}>
            Add first variable
          </Button>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {filtered.map((item) => (
            <VariableItem
              key={item.id}
              item={item}
              isAdmin={isAdmin}
              onEdit={openEdit}
              onDelete={(id) => {
                setSelectedId(id);
                setConfirmDeleteOpen(true);
              }}
              formatDate={formatDate}
            />
          ))}
        </div>
      )}
    </Panel>
  );
}
