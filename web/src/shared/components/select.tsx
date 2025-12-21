"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/shared/lib/cn";
import { Icon } from "@/shared/components/icon";

export type SelectOption = {
  value: string | number;
  label: string;
  description?: string;
  disabled?: boolean;
};

type Props = {
  value: string | number;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  leadingIcon?: string;
  className?: string;
};

export function Select({
  value,
  options,
  onChange,
  placeholder = "Select…",
  searchable,
  searchPlaceholder = "Search…",
  leadingIcon,
  className,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement | null>(null);

  const selected = useMemo(() => options.find((o) => o.value === value) || null, [options, value]);
  const filtered = useMemo(() => {
    if (!searchable) return options;
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query, searchable]);

  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e: MouseEvent) => {
      const el = rootRef.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        className={cn(
          "h-10 w-full rounded-lg bg-surface border border-border text-sm font-medium text-text focus:outline-none focus:shadow-focus hover:bg-surface2 transition-colors",
          "inline-flex items-center gap-2 px-3",
          open ? "border-[color-mix(in_srgb,var(--accent)_55%,var(--border))]" : ""
        )}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {leadingIcon ? <Icon name={leadingIcon} className="text-[18px] text-muted" /> : null}
        <span className="min-w-0 flex-1 truncate text-left">
          {selected ? selected.label : <span className="text-muted">{placeholder}</span>}
        </span>
        <Icon name="expand_more" className={cn("text-[18px] text-muted transition-transform", open ? "rotate-180" : "")} />
      </button>

      {open ? (
        <div
          className="absolute z-30 mt-2 w-full min-w-[220px] rounded-xl border border-border bg-panel shadow-lift overflow-hidden"
          role="listbox"
        >
          {searchable ? (
            <div className="p-2 border-b border-border">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full h-9 rounded-lg bg-surface border border-border px-3 text-sm text-text focus:outline-none focus:shadow-focus"
                autoFocus
              />
            </div>
          ) : null}

          <div className="max-h-[280px] overflow-auto p-1">
            {filtered.length === 0 ? (
              <div className="px-3 py-2 text-sm text-muted">No results</div>
            ) : (
              filtered.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={String(opt.value)}
                    type="button"
                    disabled={opt.disabled}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg transition-colors",
                      "flex items-start gap-2",
                      opt.disabled ? "opacity-60" : "hover:bg-surface2",
                      isSelected ? "bg-surface2" : ""
                    )}
                    onClick={() => {
                      onChange(String(opt.value));
                      setOpen(false);
                    }}
                  >
                    <span className="min-w-0 flex-1">
                      <div className={cn("text-sm", isSelected ? "font-semibold text-text" : "text-text")}>
                        {opt.label}
                      </div>
                      {opt.description ? <div className="text-xs text-muted">{opt.description}</div> : null}
                    </span>
                    {isSelected ? <Icon name="check_circle" className="text-[16px] text-accent mt-0.5" /> : null}
                  </button>
                );
              })
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

