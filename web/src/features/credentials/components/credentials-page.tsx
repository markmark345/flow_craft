"use client";

import { Button } from "@/shared/components/button";
import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import { Icon } from "@/shared/components/icon";
import { Input } from "@/shared/components/input";
import { Panel } from "@/shared/components/panel";
import { Select } from "@/shared/components/select";
import { cn } from "@/shared/lib/cn";
import Link from "next/link";
import { useCredentialsPage } from "../hooks/use-credentials-page";

export function CredentialsPage({ scope, projectId }: { scope: "personal" | "project"; projectId?: string }) {
  const {
    filtered,
    project,
    loading,
    menuOpen,
    menuRef,
    confirmDeleteOpen,
    deleting,
    isAdmin,
    headerTitle,
    query,
    sortKey,
    projectNavItems,
    setQuery,
    setSortKey,
    setMenuOpen,
    setConfirmDeleteOpen,
    setSelectedId,
    reload,
    onConnect,
    onDelete,
  } = useCredentialsPage(scope, projectId);

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
              <span className="text-text">Credentials</span>
            </div>
          ) : null}
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-text">{headerTitle}</h2>
              <p className="text-muted text-sm">
                {scope === "project"
                  ? `Manage credentials for ${project?.name || "this project"}.`
                  : "Manage your personal app connections."}
              </p>
              {!isAdmin && scope === "project" ? (
                <div className="text-xs text-muted mt-1">Only project admins can connect or disconnect credentials.</div>
              ) : null}
            </div>
            <div className="relative" ref={menuRef}>
              <div className="flex shadow-soft rounded-lg overflow-hidden">
                <Button
                  className="rounded-none px-5"
                  onClick={() => setMenuOpen((v) => !v)}
                  disabled={!isAdmin}
                >
                  <Icon name="add" className="text-[18px] mr-2" />
                  Create credential
                </Button>
                <button
                  type="button"
                  className="h-10 w-10 bg-accent text-white flex items-center justify-center border-l border-white/20 hover:bg-accentStrong transition-colors"
                  onClick={() => setMenuOpen((v) => !v)}
                  disabled={!isAdmin}
                  aria-label="Toggle credential menu"
                >
                  <Icon name="expand_more" className="text-[18px]" />
                </button>
              </div>
              {menuOpen ? (
                <div className="absolute right-0 mt-2 w-48 rounded-xl border border-border bg-panel shadow-lift overflow-hidden z-20">
                  <button
                    type="button"
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-text hover:bg-surface2 transition-colors"
                    onClick={() => {
                      setMenuOpen(false);
                      onConnect("google");
                    }}
                  >
                    <Icon name="google" className="text-[18px]" />
                    Connect Google
                  </button>
                  <button
                    type="button"
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-text hover:bg-surface2 transition-colors"
                    onClick={() => {
                      setMenuOpen(false);
                      onConnect("github");
                    }}
                  >
                    <Icon name="github" className="text-[18px]" />
                    Connect GitHub
                  </button>
                </div>
              ) : null}
            </div>
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
                placeholder="Search credentials..."
                className="pl-9 bg-surface2 rounded-lg"
              />
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={sortKey}
                options={[
                  { value: "updated", label: "Sort by last updated" },
                  { value: "created", label: "Sort by created" },
                  { value: "name", label: "Sort by name" },
                ]}
                onChange={(value) => setSortKey(value as "updated" | "created" | "name")}
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
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-text">Connected apps</h3>
                <p className="text-sm text-muted">Use these credentials in nodes.</p>
              </div>
              <Button variant="secondary" className="rounded-lg" onClick={reload} disabled={loading}>
                {loading ? "Refreshing..." : "Refresh"}
              </Button>
            </div>

            {loading ? (
              <div className="text-sm text-muted">Loading credentials...</div>
            ) : filtered.length === 0 ? (
              <div className="text-sm text-muted">No credentials connected yet.</div>
            ) : (
              <div className="divide-y divide-border">
                {filtered.map((item) => (
                  <div key={item.id} className="py-4 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="h-10 w-10 rounded-xl bg-surface2 border border-border flex items-center justify-center">
                        <Icon name={item.provider === "github" ? "github" : "google"} className="text-[18px]" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-text">{item.name}</div>
                        <div className="text-xs text-muted">
                          {item.provider.toUpperCase()} · Updated {formatDate(item.updatedAt)} · Created {formatDate(item.createdAt)}
                        </div>
                        <div className="text-xs text-muted truncate max-w-[420px]">
                          {item.accountEmail ? item.accountEmail : "Connected account"}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 rounded-md border border-border bg-surface2 text-xs text-muted">
                        {item.scope === "project" ? "Project" : "Personal"}
                      </span>
                      <Button
                        variant="secondary"
                        className="rounded-lg border-red text-red"
                        onClick={() => {
                          setSelectedId(item.id);
                          setConfirmDeleteOpen(true);
                        }}
                        disabled={!isAdmin}
                      >
                        Disconnect
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDeleteOpen}
        title="Disconnect credential?"
        description="This will remove the credential from FlowCraft. Any nodes using it will fail until you reconnect."
        confirmLabel="Disconnect"
        confirmVariant="danger"
        loading={deleting}
        onConfirm={onDelete}
        onClose={() => setConfirmDeleteOpen(false)}
      />
    </div>
  );
}

function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date);
}
