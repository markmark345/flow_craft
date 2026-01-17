"use client";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useSettingsPage } from "../hooks/use-settings-page";
import { WorkspaceSection } from "./settings/WorkspaceSection";
import { AccessSection } from "./settings/AccessSection";
import { DangerSection } from "./settings/DangerSection";
import { PreferencesSection } from "./settings/PreferencesSection";
import { ProfileSection } from "./settings/ProfileSection";
import { SystemSection } from "./settings/SystemSection";

export function SettingsPage() {
  const {
    theme,
    workspaceName,
    confirmResetOpen,
    reduceMotion,
    autoSaveFlows,
    resetting,
    profileName,
    profileEmail,
    profileAvatar,
    workspaceId,
    setTheme,
    setWorkspaceNameDraft,
    setConfirmResetOpen,
    setReduceMotion,
    setAutoSaveFlows,
    copyWorkspaceId,
    saveWorkspace,
    onClearLocalCache,
    onConfirmReset,
    onSignOut,
    navigateTo,
    showInfo,
  } = useSettingsPage();

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-10 bg-panel border-b border-border px-8 py-6">
        <div className="max-w-[1440px] mx-auto flex flex-col gap-2">
          <h2 className="text-2xl font-bold tracking-tight text-text">Settings</h2>
          <p className="text-muted text-sm">Workspace and preferences</p>
        </div>
      </header>

      <div className="p-8">
        <div className="max-w-[1440px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7 flex flex-col gap-6">
              <WorkspaceSection
                workspaceName={workspaceName}
                workspaceId={workspaceId}
                setWorkspaceNameDraft={setWorkspaceNameDraft}
                copyWorkspaceId={copyWorkspaceId}
                saveWorkspace={saveWorkspace}
              />

              <AccessSection navigateTo={navigateTo} />

              <DangerSection
                resetting={resetting}
                setConfirmResetOpen={setConfirmResetOpen}
                onClearLocalCache={onClearLocalCache}
              />
            </div>

            <div className="lg:col-span-5 flex flex-col gap-6">
              <PreferencesSection
                theme={theme}
                reduceMotion={reduceMotion}
                autoSaveFlows={autoSaveFlows}
                setTheme={setTheme}
                setReduceMotion={setReduceMotion}
                setAutoSaveFlows={setAutoSaveFlows}
              />

              <ProfileSection
                profileName={profileName}
                profileEmail={profileEmail}
                profileAvatar={profileAvatar}
                onSignOut={onSignOut}
                showInfo={showInfo}
              />

              <SystemSection />
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmResetOpen}
        title="Reset workspace?"
        description="This will delete all flows and run history on the backend."
        confirmLabel="Reset"
        confirmVariant="danger"
        loading={resetting}
        onConfirm={onConfirmReset}
        onClose={() => setConfirmResetOpen(false)}
      />
    </div>
  );
}
