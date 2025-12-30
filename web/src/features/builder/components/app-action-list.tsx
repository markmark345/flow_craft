"use client";

import { useMemo, useState } from "react";

import { Input } from "@/shared/components/input";
import { cn } from "@/shared/lib/cn";

import { APP_CATALOG, listAppActions, type AppActionListItem, type AppKey } from "../nodeCatalog/catalog";
import { NodeIcon } from "./node-icon";

type Props = {
  appKey: AppKey;
  selectedActionKey?: string | null;
  onSelect: (actionKey: string) => void;
};

export function AppActionList({ appKey, selectedActionKey, onSelect }: Props) {
  const app = APP_CATALOG[appKey];
  const [query, setQuery] = useState("");

  const allItems = useMemo(() => listAppActions(appKey), [appKey]);

  const actionCount = useMemo(
    () => allItems.filter((i) => (i.kind || "action") === "action").length,
    [allItems]
  );

  const filteredByCategory = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return app.categories;
    return app.categories
      .map((cat) => ({
        ...cat,
        items: cat.items.filter((item) => {
          const text = `${item.label} ${item.description} ${item.actionKey}`.toLowerCase();
          return text.includes(q);
        }),
      }))
      .filter((cat) => cat.items.length > 0);
  }, [app.categories, query]);

  const selectedMeta = useMemo<AppActionListItem | null>(() => {
    const actionKey = String(selectedActionKey || "").trim();
    if (!actionKey) return null;
    return allItems.find((item) => item.actionKey === actionKey) || null;
  }, [allItems, selectedActionKey]);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <div
            className="w-11 h-11 rounded-xl border flex items-center justify-center shrink-0"
            style={{
              background: "color-mix(in srgb, var(--accent) var(--accent-tint, 10%), transparent)",
              borderColor: "color-mix(in srgb, var(--accent) 18%, transparent)",
              color: "var(--accent)",
            }}
          >
            <NodeIcon nodeType={app.icon as any} className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold text-text truncate">{app.label} actions</div>
            <div className="text-xs text-muted truncate">Actions ({actionCount})</div>
            {selectedMeta ? (
              <div className="mt-1 text-[11px] text-muted truncate">
                Selected: <span className="text-text font-semibold">{selectedMeta.label}</span>
              </div>
            ) : null}
          </div>
        </div>

        <div className="w-56 shrink-0">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${app.label}...`}
            className="h-10 bg-surface2"
          />
        </div>
      </div>

      <div className="max-h-[420px] overflow-auto pr-1 space-y-4 fc-scrollbar">
        {filteredByCategory.map((cat) => (
          <div key={cat.key} className="space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wide text-muted px-1">{cat.label}</div>
            <div className="space-y-1">
              {cat.items.map((item) => {
                const selected = selectedActionKey === item.actionKey;
                const isTrigger = (item.kind || "action") === "trigger";
                const disabled = Boolean(item.disabled) || isTrigger;
                return (
                  <button
                    key={item.actionKey}
                    type="button"
                    disabled={disabled}
                    onClick={() => onSelect(item.actionKey)}
                    className={cn(
                      "w-full text-left rounded-xl border px-3 py-3 bg-panel hover:bg-surface2 transition flex items-start gap-3",
                      selected ? "border-accent shadow-soft" : "border-border",
                      disabled ? "opacity-60 cursor-not-allowed hover:bg-panel" : ""
                    )}
                  >
                    <div
                      className="w-9 h-9 rounded-lg border flex items-center justify-center shrink-0"
                      style={{
                        background: "color-mix(in srgb, var(--muted) 10%, transparent)",
                        borderColor: "color-mix(in srgb, var(--border) 70%, transparent)",
                        color: "var(--muted)",
                      }}
                    >
                      <NodeIcon nodeType={app.icon as any} className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="text-sm font-bold text-text truncate">{item.label}</div>
                        {isTrigger ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold border text-muted border-border bg-surface2">
                            Trigger
                          </span>
                        ) : null}
                        {item.disabled ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold border text-muted border-border bg-surface2">
                            Coming soon
                          </span>
                        ) : null}
                      </div>
                      <div className="text-xs text-muted mt-0.5 line-clamp-2">{item.description || item.actionKey}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {filteredByCategory.length === 0 ? <div className="text-xs text-muted px-2 py-3">No matches</div> : null}
      </div>
    </div>
  );
}
