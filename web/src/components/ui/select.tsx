
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/icon";
import { SelectDropdown } from "./select/SelectDropdown";
import { useSelectPosition } from "./select/useSelectPosition";
import { SelectOption } from "./select/types";

export type { SelectOption };

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
  placeholder = "Select...",
  searchable,
  searchPlaceholder = "Search...",
  leadingIcon,
  className,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const dropdownPos = useSelectPosition(open, triggerRef);

  const selected = useMemo(() => options.find((o) => o.value === value) || null, [options, value]);
  const filtered = useMemo(() => {
    if (!searchable) return options;
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query, searchable]);

  // Close when clicking outside
  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e: MouseEvent) => {
      const el = rootRef.current;
      if (!el) return;
      if (!(e.target instanceof Node)) return;
      const dropdown = dropdownRef.current;
      // If click is inside trigger (root) or dropdown, ignore
      if (el.contains(e.target)) return;
      if (dropdown && dropdown.contains(e.target)) return;
      setOpen(false);
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

  // Reset query on close
  useEffect(() => {
    if (!open) {
      setQuery("");
    }
  }, [open]);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        ref={triggerRef}
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
        <Icon
          name="expand_more"
          className={cn("text-[18px] text-muted transition-transform", open ? "rotate-180" : "")}
        />
      </button>

      <SelectDropdown
        open={open}
        dropdownPos={dropdownPos}
        dropdownRef={dropdownRef}
        searchable={searchable}
        searchPlaceholder={searchPlaceholder}
        query={query}
        setQuery={setQuery}
        filtered={filtered}
        value={value}
        onChange={onChange}
        setOpen={setOpen}
      />
    </div>
  );
}
