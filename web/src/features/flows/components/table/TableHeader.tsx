"use client";

import { Checkbox } from "@/components/ui/checkbox";

type Props = {
  allSelectedOnPage: boolean;
  toggleSelectAllOnPage: () => void;
  disabled: boolean;
};

export function TableHeader({ allSelectedOnPage, toggleSelectAllOnPage, disabled }: Props) {
  return (
    <div className="grid grid-cols-12 gap-4 px-6 py-3 pr-36 bg-surface2 border-b border-border items-center text-xs font-semibold text-muted uppercase tracking-wider">
      <div className="col-span-4 flex items-center gap-3">
        <Checkbox
          checked={allSelectedOnPage}
          onCheckedChange={() => toggleSelectAllOnPage()}
          disabled={disabled}
          aria-label="Select all flows on page"
          stopPropagation
        />
        <span>Name</span>
      </div>
      <div className="col-span-2">Status</div>
      <div className="col-span-2">Last run</div>
      <div className="col-span-2">Owner</div>
      <div className="col-span-2 text-right">Updated</div>
    </div>
  );
}
