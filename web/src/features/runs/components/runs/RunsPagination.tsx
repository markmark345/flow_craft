"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { Select } from "@/components/ui/select";

type Props = {
  filteredCount: number;
  pageStartIdx: number;
  pageItemCount: number;
  pageSize: number;
  setPageSize: (v: number) => void;
  pageSafe: number;
  pageCount: number;
  setPage: (p: number) => void;
};

export function RunsPagination({
  filteredCount,
  pageStartIdx,
  pageItemCount,
  pageSize,
  setPageSize,
  pageSafe,
  pageCount,
  setPage,
}: Props) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-panel">
      <div className="text-sm text-muted">
        Showing{" "}
        <span className="font-medium text-text">
          {filteredCount === 0 ? 0 : pageStartIdx + 1}-{Math.min(pageStartIdx + pageItemCount, filteredCount)}
        </span>{" "}
        of <span className="font-medium text-text">{filteredCount}</span> results
      </div>

      <div className="flex items-center gap-3">
        <Select
          className="w-32"
          value={pageSize}
          onChange={(v) => setPageSize(Number(v))}
          options={[
            { value: 10, label: "10 per page" },
            { value: 20, label: "20 per page" },
            { value: 50, label: "50 per page" },
          ]}
        />

        <Pagination page={pageSafe} pageCount={pageCount} onChange={(p) => setPage(p)} />
      </div>
    </div>
  );
}

function Pagination({
  page,
  pageCount,
  onChange,
}: {
  page: number;
  pageCount: number;
  onChange: (p: number) => void;
}) {
  const pages = useMemo(() => {
    const unique = new Set<number>();
    unique.add(1);
    unique.add(pageCount);
    unique.add(page);
    unique.add(page - 1);
    unique.add(page + 1);
    return Array.from(unique)
      .filter((p) => p >= 1 && p <= pageCount)
      .sort((a, b) => a - b);
  }, [page, pageCount]);

  const items: Array<number | "ellipsis"> = [];
  for (let i = 0; i < pages.length; i++) {
    const current = pages[i];
    const prev = pages[i - 1];
    if (i > 0 && current - prev > 1) items.push("ellipsis");
    items.push(current);
  }

  return (
    <div className="flex items-center gap-1">
      <IconButton
        icon="chevron_left"
        className="h-9 w-9 border border-border bg-surface hover:bg-surface2 disabled:opacity-50"
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page <= 1}
        aria-label="Previous page"
      />
      {items.map((it, idx) =>
        it === "ellipsis" ? (
          <div key={`e-${idx}`} className="h-9 px-2 flex items-center text-sm text-muted">
            …
          </div>
        ) : (
          <Button
            key={it}
            variant={it === page ? "primary" : "secondary"}
            className={`h-9 w-9 p-0 rounded-lg text-sm font-medium ${
              it === page
                ? "bg-surface2 text-text border-accent"
                : "bg-surface text-muted hover:bg-surface2 hover:text-text border-border"
            }`}
            onClick={() => onChange(it)}
            aria-current={it === page ? "page" : undefined}
          >
            {it}
          </Button>
        )
      )}
      <IconButton
        icon="chevron_right"
        className="h-9 w-9 border border-border bg-surface hover:bg-surface2 disabled:opacity-50"
        onClick={() => onChange(Math.min(pageCount, page + 1))}
        disabled={page >= pageCount}
        aria-label="Next page"
      />
    </div>
  );
}
