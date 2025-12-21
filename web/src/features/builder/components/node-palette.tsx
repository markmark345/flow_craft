"use client";

import { useMemo, useState } from "react";
import { Input } from "@/shared/components/input";
import { useNodeDnd } from "../hooks/use-node-dnd";
import { NODE_CATEGORIES } from "../types/node-catalog";
import { NodeIcon } from "./node-icon";
import { Icon } from "@/shared/components/icon";

const accentVar: Record<string, string> = {
  accent: "var(--accent)",
  success: "var(--success)",
  warning: "var(--warning)",
  error: "var(--error)",
  trigger: "var(--trigger)",
  slack: "var(--slack)",
  neutral: "var(--muted)",
};

export function NodePalette() {
  const [query, setQuery] = useState("");
  const { onDragStart } = useNodeDnd();
  const canvasItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    const items = [
      {
        type: "stickyNote" as const,
        label: "Sticky Note",
        description: "Add an annotation on the canvas",
        accent: "warning",
      },
    ];
    if (!q) return items;
    return items.filter((i) => `${i.label} ${i.description}`.toLowerCase().includes(q));
  }, [query]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return NODE_CATEGORIES;
    return NODE_CATEGORIES.map((cat) => ({
      ...cat,
      items: cat.items.filter((item) => {
        const label = item.label.toLowerCase();
        const desc = item.description.toLowerCase();
        return label.includes(q) || desc.includes(q);
      }),
    })).filter((cat) => cat.items.length > 0);
  }, [query]);

  return (
    <aside className="w-72 bg-panel border-r border-border flex flex-col z-20 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)]">
      <div className="p-4 border-b border-border">
        <div className="relative group">
          <Icon
            name="search"
            className="absolute left-2.5 top-2 text-muted group-focus-within:text-accent transition-colors text-[20px]"
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search nodes..."
            className="h-9 pl-9 bg-surface2 shadow-soft"
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto p-3 space-y-4">
        {filtered.map((cat) => (
          <div key={cat.id} className="flex flex-col gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted px-2">
              {cat.label}
            </h3>
            <div className="space-y-1">
              {cat.items.map((item) => {
                const c = accentVar[item.accent] || "var(--accent)";
                return (
                  <div
                    key={item.type}
                    draggable
                    onDragStart={(e) => onDragStart(e, { type: item.type, label: item.label })}
                    className="flex items-center gap-3 p-2 rounded-lg bg-surface hover:bg-surface2 cursor-grab active:cursor-grabbing border border-border hover:shadow-soft transition-all group select-none"
                    style={{
                      borderColor: "color-mix(in srgb, var(--border) 70%, transparent)",
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-md flex items-center justify-center shrink-0 border"
                      style={{
                        color: c,
                        background: `color-mix(in srgb, ${c} 14%, transparent)`,
                        borderColor: `color-mix(in srgb, ${c} 24%, transparent)`,
                      }}
                    >
                      <NodeIcon nodeType={item.type} className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-semibold text-text group-hover:text-text">
                        {item.label}
                      </span>
                      <span className="text-[10px] text-muted truncate">{item.description}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {canvasItems.length ? (
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted px-2">Canvas</h3>
            <div className="space-y-1">
              {canvasItems.map((item) => {
                const c = accentVar[item.accent] || "var(--accent)";
                return (
                  <div
                    key={item.type}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("application/reactflow/node-type", item.type);
                      e.dataTransfer.setData("application/reactflow/node-label", item.label);
                      e.dataTransfer.effectAllowed = "move";
                    }}
                    className="flex items-center gap-3 p-2 rounded-lg bg-surface hover:bg-surface2 cursor-grab active:cursor-grabbing border border-border hover:shadow-soft transition-all group select-none"
                    style={{
                      borderColor: "color-mix(in srgb, var(--border) 70%, transparent)",
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-md flex items-center justify-center shrink-0 border"
                      style={{
                        color: c,
                        background: `color-mix(in srgb, ${c} 14%, transparent)`,
                        borderColor: `color-mix(in srgb, ${c} 24%, transparent)`,
                      }}
                    >
                      <Icon name="sticky_note" className="text-[18px]" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-semibold text-text group-hover:text-text">{item.label}</span>
                      <span className="text-[10px] text-muted truncate">{item.description}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </aside>
  );
}
