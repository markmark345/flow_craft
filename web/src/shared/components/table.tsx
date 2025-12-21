import { ReactNode } from "react";

export function Table({ head, rows }: { head: string[]; rows: ReactNode[] }) {
  return (
    <div className="rounded-md border border-border overflow-hidden bg-surface">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] bg-panel px-3 py-2 text-xs text-muted">
        {head.map((h) => (
          <div key={h}>{h}</div>
        ))}
      </div>
      <div className="divide-y divide-border text-sm">
        {rows.length ? rows : <div className="p-3 text-muted">No data.</div>}
      </div>
    </div>
  );
}
