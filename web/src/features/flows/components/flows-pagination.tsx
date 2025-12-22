"use client";

import { Icon } from "@/shared/components/icon";
import { Select } from "@/shared/components/select";

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
          <button
            type="button"
            className="px-3 h-9 border-r border-border hover:bg-surface2 disabled:opacity-50 transition-colors"
            onClick={onPrev}
            disabled={pageSafe <= 1}
            aria-label="Previous page"
          >
            <Icon name="chevron_left" className="text-[18px] text-muted" />
          </button>
          <div className="px-4 h-9 flex items-center text-sm font-medium text-text">{pageSafe}</div>
          <button
            type="button"
            className="px-3 h-9 border-l border-border hover:bg-surface2 disabled:opacity-50 transition-colors"
            onClick={onNext}
            disabled={pageSafe >= pageCount}
            aria-label="Next page"
          >
            <Icon name="chevron_right" className="text-[18px] text-muted" />
          </button>
        </div>
      </div>
    </div>
  );
}
