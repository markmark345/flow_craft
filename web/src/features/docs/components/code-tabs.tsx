"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/shared/lib/cn";
import { Icon } from "@/shared/components/icon";
import { useAppStore } from "@/shared/hooks/use-app-store";

export type CodeTab = {
  id: string;
  label: string;
  code: string;
};

export function CodeTabs({ tabs, initialTabId }: { tabs: CodeTab[]; initialTabId?: string }) {
  const showSuccess = useAppStore((s) => s.showSuccess);
  const showError = useAppStore((s) => s.showError);

  const defaultTabId = useMemo(() => initialTabId ?? tabs[0]?.id, [initialTabId, tabs]);
  const [activeId, setActiveId] = useState<string | undefined>(defaultTabId);

  useEffect(() => setActiveId(defaultTabId), [defaultTabId]);

  const active = useMemo(() => tabs.find((t) => t.id === activeId) ?? tabs[0], [activeId, tabs]);
  if (!active) return null;

  return (
    <div className="rounded-xl border border-border bg-panel overflow-hidden shadow-soft">
      <div className="flex items-center justify-between gap-3 px-3 pt-3">
        <div className="flex items-center gap-1">
          {tabs.map((t) => {
            const isActive = t.id === active.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveId(t.id)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors",
                  isActive ? "text-text" : "text-muted hover:text-text hover:bg-surface2"
                )}
                style={
                  isActive
                    ? {
                        background: "color-mix(in srgb, var(--accent) 12%, transparent)",
                        color: "var(--text)",
                      }
                    : undefined
                }
              >
                {t.label}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center size-8 rounded-lg text-muted hover:text-text hover:bg-surface2 transition-colors"
          title="Copy"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(active.code);
              showSuccess("Copied", "Code copied to clipboard.");
            } catch (err: any) {
              showError("Copy failed", err?.message || "Unable to copy");
            }
          }}
        >
          <Icon name="content_copy" className="text-[18px]" />
        </button>
      </div>

      <pre className="px-4 pb-4 pt-3 overflow-x-auto text-xs font-mono leading-relaxed text-text">
        <code>{active.code}</code>
      </pre>
    </div>
  );
}

