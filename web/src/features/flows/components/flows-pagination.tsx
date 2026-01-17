"use client";

import { Icon } from "@/components/ui/icon";
import { IconButton } from "@/components/ui/icon-button";
import { Select } from "@/components/ui/select";

export function FlowsPagination({
  filteredCount,
  pageStartIdx,
  pageItemsLength,
  pageSafe,
  pageCount,
  pageSize,
  onPageSizeChange,
  onPrev,
  onNext,
}: {
  filteredCount: number;
  pageStartIdx: number;
  pageItemsLength: number;
  pageSafe: number;
  pageCount: number;
  pageSize: number;
  onPageSizeChange: (value: number) => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="pt-2 flex items-center justify-between">
      <div className="text-sm text-muted">
        {filteredCount === 0 ? (
          "Showing 0 flows"
        ) : (
          <>
            Showing{" "}
            <span className="font-medium text-text">
              {pageStartIdx + 1}-{Math.min(pageStartIdx + pageItemsLength, filteredCount)}
            </span>{" "}
            of <span className="font-medium text-text">{filteredCount}</span> flows
          </>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Select
          className="w-[150px]"
          value={pageSize}
          onChange={(v) => onPageSizeChange(Number(v))}
          options={[
            { value: 10, label: "10 per page" },
            { value: 25, label: "25 per page" },
            { value: 50, label: "50 per page" },
          ]}
        />

        <div className="flex items-center rounded-lg border border-border bg-surface overflow-hidden">
          <IconButton
            icon="chevron_left"
            className="px-3 h-9 border-r border-border hover:bg-surface2 disabled:opacity-50 transition-colors w-auto rounded-none"
            onClick={onPrev}
            disabled={pageSafe <= 1}
            aria-label="Previous page"
          />
          <div className="px-4 h-9 flex items-center text-sm font-medium text-text">{pageSafe}</div>
          <IconButton
            icon="chevron_right"
            className="px-3 h-9 border-l border-border hover:bg-surface2 disabled:opacity-50 transition-colors w-auto rounded-none"
            onClick={onNext}
            disabled={pageSafe >= pageCount}
            aria-label="Next page"
          />
        </div>
      </div>
    </div>
  );
}
