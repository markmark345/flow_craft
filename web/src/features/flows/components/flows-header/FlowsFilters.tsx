"use client";

import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { FlowDTO } from "@/types/dto";

interface FlowsFiltersProps {
  query: string;
  onQueryChange: (value: string) => void;
  status: "all" | FlowDTO["status"];
  onStatusChange: (value: "all" | FlowDTO["status"]) => void;
  owner: string;
  onOwnerChange: (value: string) => void;
  ownerOptions: string[];
}

export function FlowsFilters({
  query,
  onQueryChange,
  status,
  onStatusChange,
  owner,
  onOwnerChange,
  ownerOptions,
}: FlowsFiltersProps) {
  return (
    <>
      <div className="relative w-full max-w-sm group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon name="search" className="text-[20px] text-muted" />
        </div>
        <Input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search flows..."
          className="h-10 pl-10 rounded-lg shadow-soft"
        />
      </div>

      <Select
        className="hidden md:block w-[170px]"
        value={status}
        onChange={(v) => onStatusChange(v as "all" | FlowDTO["status"])}
        leadingIcon="filter_list"
        options={[
          { value: "all", label: "All statuses" },
          { value: "draft", label: "Draft" },
          { value: "active", label: "Active" },
          { value: "archived", label: "Archived" },
        ]}
      />

      <Select
        className="hidden md:block w-[220px]"
        value={owner}
        onChange={onOwnerChange}
        leadingIcon="person"
        searchable
        searchPlaceholder="Search owners…"
        options={ownerOptions.map((value) => ({
          value,
          label: value === "all" ? "All owners" : value,
        }))}
      />
    </>
  );
}
