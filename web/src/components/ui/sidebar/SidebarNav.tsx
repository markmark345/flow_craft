
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { Icon, IconName } from "@/components/ui/icon";

export type NavItem = {
  label: string;
  href: string;
  icon: IconName;
};

interface SidebarNavProps {
  items: readonly NavItem[];
}

export function SidebarNav({ items }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href as any}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group",
              isActive ? "text-accent" : "text-muted hover:bg-surface2 hover:text-text"
            )}
            style={
              isActive
                ? { background: "color-mix(in srgb, var(--accent) var(--accent-tint, 10%), transparent)" }
                : undefined
            }
          >
            <span
              className={cn("transition-colors", isActive ? "text-accent" : "text-muted group-hover:text-accent")}
            >
              <Icon name={item.icon} className="text-[20px]" />
            </span>
            <span className={cn("text-sm", isActive ? "font-bold" : "font-medium")}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
