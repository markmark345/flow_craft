"use client";

import Link from "next/link";
import type { Route } from "next";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/icon";
import { DOCS_FOOTER_LINKS } from "../../lib/docs-data";
import { DocsNavGroup, DocsNavItem } from "../../lib/docs-data-types";

type Props = {
  filteredNav: DocsNavGroup[];
  href: string;
};

export function DocsSidebar({ filteredNav, href }: Props) {
  return (
    <aside className="w-64 shrink-0 border-r border-border bg-surface2 overflow-y-auto hidden lg:flex flex-col">
      <nav className="flex-1 p-4 space-y-8">
        {filteredNav.map((group) => (
          <div key={group.label}>
            <h3 className="px-3 text-xs font-bold text-muted uppercase tracking-wider mb-2">
              {group.label}
            </h3>
            <div className="space-y-1">
              {group.items.map((item: DocsNavItem) => {
                const isActive = item.href === href;
                return (
                  <Link
                    key={item.href}
                    href={item.href as Route}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium",
                      isActive ? "text-accent" : "text-muted hover:text-text hover:bg-panel"
                    )}
                    style={
                      isActive
                        ? { background: "color-mix(in srgb, var(--accent) 12%, transparent)" }
                        : undefined
                    }
                  >
                    <Icon
                      name={item.icon}
                      className={cn("text-[18px]", isActive ? "text-accent" : "text-muted")}
                    />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-border space-y-2">
        {DOCS_FOOTER_LINKS.map((item) => (
          <Link
            key={item.href}
            href={item.href as Route}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted hover:text-text hover:bg-panel transition-colors text-sm font-medium"
          >
            <Icon name={item.icon} className="text-[18px]" />
            <span className="truncate">{item.label}</span>
          </Link>
        ))}
      </div>
    </aside>
  );
}
