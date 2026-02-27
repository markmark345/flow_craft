
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/icon";
import { SelectOption } from "./types";
import { DropdownPos } from "./useSelectPosition";

interface SelectDropdownProps {
  open: boolean;
  dropdownPos: DropdownPos | null;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
  searchable?: boolean;
  searchPlaceholder?: string;
  query: string;
  setQuery: (query: string) => void;
  filtered: SelectOption[];
  value: string | number;
  onChange: (value: string) => void;
  setOpen: (open: boolean) => void;
}

export function SelectDropdown({
  open,
  dropdownPos,
  dropdownRef,
  searchable,
  searchPlaceholder,
  query,
  setQuery,
  filtered,
  value,
  onChange,
  setOpen,
}: SelectDropdownProps) {
  const portalTarget = typeof document !== "undefined" ? document.body : null;

  if (!open || !portalTarget || !dropdownPos) return null;

  return createPortal(
    <div
      ref={dropdownRef}
      className="fixed z-[60] rounded-xl border border-border bg-panel shadow-lift overflow-hidden flex flex-col"
      style={{
        left: dropdownPos.left,
        width: dropdownPos.width,
        top: dropdownPos.top,
        bottom: dropdownPos.bottom,
        maxHeight: dropdownPos.maxHeight,
      }}
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

      <div className="flex-1 overflow-auto p-1 fc-scrollbar">
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
    </div>,
    portalTarget
  );
}
