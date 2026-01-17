"use client";

import { Input } from "@/shared/components/input";
import type { BuilderNodeType } from "../../../types";
import type { NodeCategory, NodeCatalogItem } from "../../../types/node-catalog";

interface NodePickerProps {
  isOpen: boolean;
  query: string;
  groups: Array<{ id: NodeCategory; label: string; items: NodeCatalogItem[] }>;
  popupTop: string;
  accentVar: Record<string, string>;
  onQueryChange: (query: string) => void;
  onQuickAdd: (nodeType: BuilderNodeType) => void;
  onMouseDown: (e: React.MouseEvent) => void;
  onClick: (e: React.MouseEvent) => void;
}

export function NodePicker({
  isOpen,
  query,
  groups,
  popupTop,
  accentVar,
  onQueryChange,
  onQuickAdd,
  onMouseDown,
  onClick,
}: NodePickerProps) {
  if (!isOpen) return null;

  return (
    <div
      className="absolute right-10 -translate-y-1/2 w-64 rounded-xl border border-border bg-panel shadow-lift p-2"
      style={{ top: popupTop }}
      onMouseDown={onMouseDown}
      onClick={onClick}
    >
      <Input
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="Add node..."
        className="h-9"
        autoFocus
      />
      <div className="mt-2 max-h-72 overflow-auto pr-1 space-y-3 fc-scrollbar">
        {groups.length === 0 ? (
          <div className="text-xs text-muted px-2 py-2">No matches</div>
        ) : (
          groups.map((cat) => (
            <div key={cat.id} className="space-y-1">
              <div className="text-[10px] uppercase tracking-wide text-muted px-1">{cat.label}</div>
              <div className="space-y-1">
                {cat.items.map((item) => (
                  <button
                    key={item.type}
                    type="button"
                    className="w-full text-left rounded-md border border-border bg-surface px-2 py-1.5 hover:border-accent transition flex items-center gap-2"
                    onClick={() => onQuickAdd(item.type)}
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: accentVar[item.accent] || "var(--accent)" }}
                    />
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-text leading-5">{item.label}</div>
                      <div className="text-xs text-muted truncate">{item.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
