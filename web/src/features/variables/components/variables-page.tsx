"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/shared/components/button";
import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import { Icon } from "@/shared/components/icon";
import { Input } from "@/shared/components/input";
import { Panel } from "@/shared/components/panel";
import { Select } from "@/shared/components/select";
import { cn } from "@/shared/lib/cn";
import { useVariablesPage } from "../hooks/use-variables-page";

export function VariablesPage({ scope, projectId }: { scope: "personal" | "project"; projectId?: string }) {
  const {
    filtered,
    project,
    loading,
    isAdmin,
    headerTitle,
    modalOpen,
    editing,
    draftKey,
    draftValue,
    saving,
    confirmDeleteOpen,
    deleting,
    query,
    sortKey,
    projectNavItems,
    setQuery,
    setSortKey,
    setModalOpen,
    setDraftKey,
    setDraftValue,
    setConfirmDeleteOpen,
    setSelectedId,
    openCreate,
    openEdit,
    onSave,
    onDelete,
  } = useVariablesPage(scope, projectId);

  return (
    <div className="min-h-screen bg-bg">
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
                <div className="text-xs text-muted mt-1">Only project admins can create or edit variables.</div>
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

      <div className="p-8">
        <div className="max-w-[1200px] mx-auto space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[260px] max-w-[420px]">
              <Icon name="search" className="absolute left-3 top-2.5 text-[18px] text-muted" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search variables..."
                className="pl-9 bg-surface2 rounded-lg"
              />
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={sortKey}
                options={[
                  { value: "updated", label: "Sort by last updated" },
                  { value: "created", label: "Sort by created" },
                  { value: "key", label: "Sort by key" },
                ]}
                onChange={(value) => setSortKey(value as "updated" | "created" | "key")}
                className="min-w-[200px]"
              />
              <button
                type="button"
                className="inline-flex items-center justify-center h-10 w-10 rounded-lg border border-border bg-surface hover:bg-surface2 text-muted hover:text-text transition-colors"
                title="Filter (coming soon)"
              >
                <Icon name="filter_list" className="text-[18px]" />
              </button>
            </div>
          </div>

          <Panel className="p-6">
            {loading ? (
              <div className="text-sm text-muted">Loading variables...</div>
            ) : filtered.length === 0 ? (
              <div className="border border-dashed border-border rounded-xl p-10 text-center space-y-3">
                <div className="text-3xl">👋</div>
                <div className="text-base font-semibold text-text">Let&apos;s set up a variable</div>
                <div className="text-sm text-muted">
                  Store values once and reuse them across multiple workflows.
                </div>
                <Button className="rounded-lg" onClick={openCreate} disabled={!isAdmin}>
                  Add first variable
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filtered.map((item) => (
                  <div key={item.id} className="py-4 flex flex-wrap items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-text">{item.key}</div>
                      <div className="text-xs text-muted truncate max-w-[520px]">{item.value || "—"}</div>
                      <div className="text-[11px] text-muted mt-1">
                        Updated {formatDate(item.updatedAt)} · Created {formatDate(item.createdAt)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="h-9 px-3 rounded-lg border border-border bg-surface2 text-xs font-semibold text-text hover:bg-surface transition-colors"
                        onClick={() => openEdit(item)}
                        disabled={!isAdmin}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="h-9 w-9 rounded-lg border border-border bg-surface2 text-red hover:bg-surface transition-colors"
                        onClick={() => {
                          setSelectedId(item.id);
                          setConfirmDeleteOpen(true);
                        }}
                        disabled={!isAdmin}
                        aria-label="Delete variable"
                      >
                        <Icon name="delete" className="text-[16px]" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>
      </div>

      <VariableModal
        open={modalOpen}
        title={editing ? "Edit variable" : "New variable"}
        keyValue={draftKey}
        value={draftValue}
        saving={saving}
        onKeyChange={setDraftKey}
        onValueChange={setDraftValue}
        onClose={() => setModalOpen(false)}
        onSave={onSave}
      />

      <ConfirmDialog
        open={confirmDeleteOpen}
        title="Delete variable?"
        description="This removes the variable. Any workflows referencing it will fail until you replace it."
        confirmLabel="Delete"
        confirmVariant="danger"
        loading={deleting}
        onConfirm={onDelete}
        onClose={() => setConfirmDeleteOpen(false)}
      />
    </div>
  );
}

function VariableModal({
  open,
  title,
  keyValue,
  value,
  saving,
  onKeyChange,
  onValueChange,
  onClose,
  onSave,
}: {
  open: boolean;
  title: string;
  keyValue: string;
  value: string;
  saving: boolean;
  onKeyChange: (value: string) => void;
  onValueChange: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-panel border border-border shadow-lift overflow-hidden"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-muted hover:text-text transition-colors rounded-full p-1"
          aria-label="Close"
        >
          <Icon name="close" className="text-[18px]" />
        </button>

        <div className="px-8 pt-8 pb-2">
          <h2 className="text-xl font-bold text-text">{title}</h2>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (!saving) onSave();
          }}
        >
          <div className="px-8 py-4 space-y-5">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-muted" htmlFor="variable-key">
                Key
              </label>
              <Input
                id="variable-key"
                value={keyValue}
                onChange={(event) => onKeyChange(event.target.value)}
                className="h-11 rounded-lg"
                autoFocus
                disabled={saving}
                placeholder="Enter a name"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-muted" htmlFor="variable-value">
                Value
              </label>
              <textarea
                id="variable-value"
                value={value}
                onChange={(event) => onValueChange(event.target.value)}
                className="w-full min-h-[120px] rounded-lg bg-surface border border-border px-3 py-2 text-sm text-text placeholder:text-muted focus:outline-none focus:shadow-focus"
                disabled={saving}
                placeholder="Enter a value"
              />
            </div>
          </div>

          <div className="px-8 pt-4 pb-8 flex items-center justify-end gap-3">
            <button
              type="button"
              className="text-sm font-medium text-muted hover:text-text transition-colors"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <Button type="submit" disabled={saving} className="rounded-lg px-6">
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date);
}
