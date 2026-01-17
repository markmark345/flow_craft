"use client";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Icon } from "@/components/ui/icon";
import { IconButton } from "@/components/ui/icon-button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useCredentialsPage } from "../hooks/use-credentials-page";
import { CredentialsHeader } from "./credentials/CredentialsHeader";
import { CredentialsList } from "./credentials/CredentialsList";

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
      <CredentialsHeader
        scope={scope}
        project={project}
        headerTitle={headerTitle}
        isAdmin={isAdmin}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        menuRef={menuRef}
        projectNavItems={projectNavItems}
        onConnect={onConnect}
      />

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
              <IconButton
                icon="filter_list"
                className="h-10 w-10 border border-border bg-surface hover:bg-surface2 text-muted hover:text-text transition-colors"
                title="Filter (coming soon)"
              />
            </div>
          </div>

          <CredentialsList
            loading={loading}
            filtered={filtered}
            isAdmin={isAdmin}
            reload={reload}
            formatDate={formatDate}
            onDisconnect={(id) => {
              setSelectedId(id);
              setConfirmDeleteOpen(true);
            }}
          />
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

import { formatDate } from "@/lib/date-utils";
