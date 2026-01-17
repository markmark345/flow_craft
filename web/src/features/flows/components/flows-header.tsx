"use client";

"use client";

import type { FlowDTO } from "@/types/dto";
import { useFlowsHeader } from "../hooks/use-flows-header";
import { CreateFlowMenu } from "./flows-header/CreateFlowMenu";
import { ImportFlowButton } from "./flows-header/ImportFlowButton";
import { FlowsFilters } from "./flows-header/FlowsFilters";
import { FlowsViewControls } from "./flows-header/FlowsViewControls";

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
  const { createMenuOpen, setCreateMenuOpen, createMenuRef, fileRef, onImportClick, handleImportFile } =
    useFlowsHeader(onImportFile);

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
            <CreateFlowMenu
              createMenuRef={createMenuRef}
              createMenuOpen={createMenuOpen}
              setCreateMenuOpen={setCreateMenuOpen}
              onCreatePersonal={onCreatePersonal}
              onCreateProject={onCreateProject}
              canCreateProject={canCreateProject}
              projectLabel={projectLabel}
            />
            <ImportFlowButton
              importing={importing}
              onImportClick={onImportClick}
              fileRef={fileRef}
              handleImportFile={handleImportFile}
            />
          </div>

          <div className="flex flex-1 w-full lg:w-auto lg:justify-end items-center gap-3">
            <FlowsFilters
              query={query}
              onQueryChange={onQueryChange}
              status={status}
              onStatusChange={onStatusChange}
              owner={owner}
              onOwnerChange={onOwnerChange}
              ownerOptions={ownerOptions}
            />

            <FlowsViewControls
              onShowInfo={onShowInfo}
              onReload={onReload}
              flowsLoading={flowsLoading}
              runsLoading={runsLoading}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
