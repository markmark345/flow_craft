"use client";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Icon } from "@/components/ui/icon";
import { IconButton } from "@/components/ui/icon-button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useVariablesPage } from "../hooks/use-variables-page";
import { VariablesHeader } from "./variables/VariablesHeader";
import { VariablesList } from "./variables/VariablesList";
import { VariableModal } from "./variables/VariableModal";

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
      <VariablesHeader
        scope={scope}
        project={project}
        headerTitle={headerTitle}
        isAdmin={isAdmin}
        projectNavItems={projectNavItems}
        openCreate={openCreate}
      />

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
              <IconButton
                icon="filter_list"
                className="h-10 w-10 border border-border bg-surface hover:bg-surface2 text-muted hover:text-text transition-colors"
                title="Filter (coming soon)"
              />
            </div>
          </div>

          <VariablesList
            loading={loading}
            filtered={filtered}
            isAdmin={isAdmin}
            openCreate={openCreate}
            openEdit={openEdit}
            setConfirmDeleteOpen={setConfirmDeleteOpen}
            setSelectedId={setSelectedId}
            formatDate={formatDate}
          />
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

import { formatDate } from "@/lib/date-utils";
