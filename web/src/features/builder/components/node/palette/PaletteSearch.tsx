"use client";

import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";

type Props = {
  query: string;
  setQuery: (val: string) => void;
};

export function PaletteSearch({ query, setQuery }: Props) {
  return (
    <div className="p-4 border-b border-border">
      <div className="relative group">
        <Icon
          name="search"
          className="absolute left-2.5 top-2 text-muted group-focus-within:text-accent transition-colors text-[20px]"
        />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search nodes..."
          className="h-9 pl-9 bg-surface2 shadow-soft"
        />
      </div>
    </div>
  );
}
