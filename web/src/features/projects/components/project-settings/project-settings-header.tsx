"use client";

import Link from "next/link";

import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";

type NavItem = {
  id: string;
  label: string;
  href: string;
  active?: boolean;
  onClick?: () => void;
};

type Props = {
  navItems: NavItem[];
  projectInitials: string;
  projectName: string;
};

export function ProjectSettingsHeader({ navItems, projectInitials, projectName }: Props) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
        <span className="inline-flex items-center gap-1 rounded-full border border-border bg-surface2 px-2 py-1">
          <span className="size-5 rounded-md bg-surface border border-border flex items-center justify-center text-[10px] font-semibold text-muted">
            {projectInitials}
          </span>
          <span className="max-w-[220px] truncate">{projectName}</span>
        </span>
        <Icon name="chevron_right" className="text-[14px]" />
        <span className="text-text">Settings</span>
      </div>
      <h1 className="text-2xl font-bold tracking-tight text-text">Project Settings</h1>
      <p className="text-sm text-muted">Manage your project details, members, and advanced options.</p>
      <div className="mt-4 border-b border-border flex gap-6 overflow-x-auto">
        {navItems.map((item) => (
          <Link
            key={item.id}
            href={item.href as any}
            onClick={item.onClick}
            className={cn(
              "pb-3 text-sm font-medium transition-colors whitespace-nowrap",
              item.active ? "text-accent border-b-2 border-accent" : "text-muted hover:text-text border-b-2 border-transparent"
            )}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
