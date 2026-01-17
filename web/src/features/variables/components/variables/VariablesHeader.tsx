"use client";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";
import Link from "next/link";
import { useVariablesPage } from "../../hooks/use-variables-page";

type Props = {
  scope: "personal" | "project";
  project: ReturnType<typeof useVariablesPage>["project"];
  headerTitle: string;
  isAdmin: boolean;
  projectNavItems: ReturnType<typeof useVariablesPage>["projectNavItems"];
  openCreate: () => void;
};

export function VariablesHeader({
  scope,
  project,
  headerTitle,
  isAdmin,
  projectNavItems,
  openCreate,
}: Props) {
  return (
    <header className="sticky top-0 z-10 bg-panel border-b border-border px-8 py-6">
      <div className="max-w-[1200px] mx-auto flex flex-col gap-4">
        {scope === "project" ? (
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
            <span className="inline-flex items-center gap-1 rounded-full border border-border bg-surface2 px-2 py-1">
              <span className="size-5 rounded-md bg-surface border border-border flex items-center justify-center text-[10px] font-semibold text-muted">
                {(project?.name || "PR").slice(0, 2).toUpperCase()}
              </span>
              <span className="max-w-[220px] truncate">{project?.name || "Project"}</span>
            </span>
            <Icon name="chevron_right" className="text-[14px]" />
            <span className="text-text">Variables</span>
          </div>
        ) : null}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-text">{headerTitle}</h2>
            <p className="text-muted text-sm">
              {scope === "project"
                ? `Manage variables for ${project?.name || "this project"}.`
                : "Manage shared values for your personal workflows."}
            </p>
            {!isAdmin && scope === "project" ? (
              <div className="text-xs text-muted mt-1">
                Only project admins can create or edit variables.
              </div>
            ) : null}
          </div>
          <Button className="rounded-lg" onClick={openCreate} disabled={!isAdmin}>
            <Icon name="add" className="text-[18px] mr-2" />
            Create variable
          </Button>
        </div>
        {projectNavItems.length ? (
          <div className="border-b border-border flex gap-6 overflow-x-auto">
            {projectNavItems.map((item) => (
              <Link
                key={item.id}
                href={item.href as any}
                onClick={item.onClick}
                className={cn(
                  "pb-3 text-sm font-medium transition-colors whitespace-nowrap",
                  item.active
                    ? "text-accent border-b-2 border-accent"
                    : "text-muted hover:text-text border-b-2 border-transparent"
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    </header>
  );
}
