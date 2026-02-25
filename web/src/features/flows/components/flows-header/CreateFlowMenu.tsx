"use client";

import { RefObject } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";

interface CreateFlowMenuProps {
  createMenuRef: RefObject<HTMLDivElement | null>;
  createMenuOpen: boolean;
  setCreateMenuOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  onCreatePersonal: () => void;
  onCreateProject: () => void;
  canCreateProject: boolean;
  projectLabel: string;
}

export function CreateFlowMenu({
  createMenuRef,
  createMenuOpen,
  setCreateMenuOpen,
  onCreatePersonal,
  onCreateProject,
  canCreateProject,
  projectLabel,
}: CreateFlowMenuProps) {
  return (
    <div ref={createMenuRef} className="relative">
      <Button
        size="md"
        className="h-10 px-4 rounded-lg gap-2"
        onClick={() => setCreateMenuOpen((v) => !v)}
      >
        <Icon name="add" className="text-[18px]" />
        Create workflow
        <Icon
          name="expand_more"
          className={cn("text-[18px] transition-transform", createMenuOpen ? "rotate-180" : "")}
        />
      </Button>

      {createMenuOpen ? (
        <div className="absolute left-0 top-full mt-2 w-56 rounded-xl border border-border bg-panel shadow-lift overflow-hidden z-30">
          <Button
            variant="ghost"
            className="w-full justify-start px-3 py-2 h-auto text-sm hover:bg-surface2 font-normal rounded-none"
            onClick={() => {
              setCreateMenuOpen(false);
              onCreatePersonal();
            }}
          >
            Personal workflow
          </Button>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start px-3 py-2 h-auto text-sm font-normal rounded-none",
              canCreateProject
                ? "hover:bg-surface2"
                : "text-muted opacity-60 cursor-not-allowed hover:bg-transparent"
            )}
            disabled={!canCreateProject}
            onClick={() => {
              if (!canCreateProject) return;
              setCreateMenuOpen(false);
              onCreateProject();
            }}
          >
            {projectLabel}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
