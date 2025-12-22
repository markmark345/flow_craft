"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "@/shared/components/button";
import { Icon } from "@/shared/components/icon";
import { Input } from "@/shared/components/input";
import { Select } from "@/shared/components/select";
import { cn } from "@/shared/lib/cn";
import type { FlowDTO } from "@/shared/types/dto";

export function FlowsHeader({
  pageTitle,
  pageSubtitle,
  importing,
  onImportFile,
  onCreatePersonal,
  onCreateProject,
  canCreateProject,
  projectLabel,
  query,
  onQueryChange,
  status,
  onStatusChange,
  owner,
  onOwnerChange,
  ownerOptions,
  onReload,
  flowsLoading,
  runsLoading,
  onShowInfo,
}: {
  pageTitle: string;
  pageSubtitle: string;
  importing: boolean;
  onImportFile: (file: File) => Promise<void> | void;
  onCreatePersonal: () => void;
  onCreateProject: () => void;
  canCreateProject: boolean;
  projectLabel: string;
  query: string;
  onQueryChange: (value: string) => void;
  status: "all" | FlowDTO["status"];
  onStatusChange: (value: "all" | FlowDTO["status"]) => void;
  owner: string;
  onOwnerChange: (value: string) => void;
  ownerOptions: string[];
  onReload: () => void;
  flowsLoading: boolean;
  runsLoading: boolean;
  onShowInfo: (title: string, message: string) => void;
}) {
  const [createMenuOpen, setCreateMenuOpen] = useState(false);
  const createMenuRef = useRef<HTMLDivElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!createMenuOpen) return;
    const onMouseDown = (e: MouseEvent) => {
      const el = createMenuRef.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) setCreateMenuOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCreateMenuOpen(false);
    };
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [createMenuOpen]);

  const onImportClick = () => fileRef.current?.click();

  const handleImportFile = async (file: File) => {
    try {
      await onImportFile(file);
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <header className="sticky top-0 z-10 bg-panel border-b border-border px-8 py-6">
      <div className="max-w-[1600px] mx-auto flex flex-col gap-6">
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-bold tracking-tight text-text">{pageTitle}</h2>
            <p className="text-muted text-sm">{pageSubtitle}</p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center gap-3 w-full lg:w-auto">
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
                  <button
                    type="button"
                    className="w-full text-left px-3 py-2 text-sm hover:bg-surface2 transition-colors"
                    onClick={() => {
                      setCreateMenuOpen(false);
                      onCreatePersonal();
                    }}
                  >
                    Personal workflow
                  </button>
                  <button
                    type="button"
                    className={cn(
                      "w-full text-left px-3 py-2 text-sm transition-colors",
                      canCreateProject ? "hover:bg-surface2" : "text-muted opacity-60 cursor-not-allowed"
                    )}
                    disabled={!canCreateProject}
                    onClick={() => {
                      if (!canCreateProject) return;
                      setCreateMenuOpen(false);
                      onCreateProject();
                    }}
                  >
                    {projectLabel}
                  </button>
                </div>
              ) : null}
            </div>
            <Button variant="secondary" size="md" className="h-10 px-4 rounded-lg" onClick={onImportClick}>
              <Icon name="download" className="text-[20px] mr-2" />
              {importing ? "Importing..." : "Import Flow"}
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handleImportFile(f);
              }}
            />
          </div>

          <div className="flex flex-1 w-full lg:w-auto lg:justify-end items-center gap-3">
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

            <div className="border-l border-border pl-3 ml-1 hidden md:flex items-center gap-1">
              <button
                type="button"
                className="p-1.5 rounded hover:bg-surface2 text-muted hover:text-text transition-colors"
                title="Grid view (coming soon)"
                onClick={() => onShowInfo("Grid view", "Grid view is coming soon.")}
              >
                <Icon name="grid_view" className="text-[20px]" />
              </button>
              <button
                type="button"
                className="p-1.5 rounded bg-surface2 text-accent transition-colors"
                title="List view"
              >
                <Icon name="view_list" className="text-[20px]" />
              </button>
              <button
                type="button"
                className="p-1.5 rounded hover:bg-surface2 text-muted hover:text-text transition-colors disabled:opacity-60"
                title="Refresh"
                onClick={onReload}
                disabled={flowsLoading || runsLoading}
              >
                <Icon name="refresh" className="text-[20px]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
