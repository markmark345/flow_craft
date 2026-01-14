"use client";

import { Button } from "@/shared/components/button";
import { Input } from "@/shared/components/input";
import { API_BASE_URL } from "@/shared/lib/env";
import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import { Icon } from "@/shared/components/icon";
import { initialsFor } from "./flows-page-utils";
import { useSettingsPage } from "../hooks/use-settings-page";

export function SettingsPage() {
  const {
    mounted,
    theme,
    workspaceName,
    confirmResetOpen,
    reduceMotion,
    autoSaveFlows,
    resetting,
    safeUser,
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
              <section className="bg-panel border border-border rounded-xl shadow-soft overflow-hidden">
                <div className="px-6 py-5 border-b border-border">
                  <h3 className="text-lg font-semibold text-text">Workspace</h3>
                </div>
                <div className="p-6 space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-muted">Workspace name</label>
                    <Input
                      value={workspaceName}
                      onChange={(e) => setWorkspaceNameDraft(e.target.value)}
                      className="h-10 rounded-lg bg-surface2"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-muted">Workspace ID</label>
                    <div className="flex rounded-lg shadow-soft">
                      <div className="relative flex-grow">
                        <Input
                          value={workspaceId}
                          readOnly
                          className="h-10 rounded-l-lg rounded-r-none bg-surface2 font-mono text-muted"
                        />
                      </div>
                      <button
                        type="button"
                        className="inline-flex items-center justify-center rounded-r-lg border border-border bg-surface2 px-4 text-sm font-medium text-text hover:bg-surface transition-colors"
                        onClick={copyWorkspaceId}
                        title="Copy"
                      >
                        <Icon name="content_copy" className="text-[18px]" />
                      </button>
                    </div>
                    <p className="text-xs text-muted">
                      Used for API authentication and CLI configuration.
                    </p>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button size="md" className="rounded-lg" onClick={saveWorkspace}>
                      Save changes
                    </Button>
                  </div>
                </div>
              </section>

              <section className="bg-panel border border-border rounded-xl shadow-soft overflow-hidden">
                <div className="px-6 py-5 border-b border-border">
                  <h3 className="text-lg font-semibold text-text">Credentials</h3>
                </div>
                <div className="p-6 flex items-center justify-between gap-6">
                  <div>
                    <div className="text-sm font-medium text-muted">Connect apps</div>
                    <div className="text-xs text-muted">Use Gmail, Sheets, and GitHub in your workflows.</div>
                  </div>
                  <Button size="md" className="rounded-lg" onClick={() => navigateTo("/settings/credentials")}>
                    Manage credentials
                  </Button>
                </div>
              </section>

              <section className="bg-panel border border-border rounded-xl shadow-soft overflow-hidden">
                <div className="px-6 py-5 border-b border-border">
                  <h3 className="text-lg font-semibold text-text">Variables</h3>
                </div>
                <div className="p-6 flex items-center justify-between gap-6">
                  <div>
                    <div className="text-sm font-medium text-muted">Reusable values</div>
                    <div className="text-xs text-muted">Store keys and values for your personal workflows.</div>
                  </div>
                  <Button size="md" className="rounded-lg" onClick={() => navigateTo("/settings/variables")}>
                    Manage variables
                  </Button>
                </div>
              </section>

              <section className="bg-panel border border-red rounded-xl shadow-soft overflow-hidden">
                <div
                  className="px-6 py-5 border-b border-red"
                  style={{ background: "color-mix(in srgb, var(--error) 10%, transparent)" }}
                >
                  <h3 className="text-lg font-semibold text-red flex items-center gap-2">
                    <Icon name="warning" className="text-[20px]" />
                    Danger Zone
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  <p className="text-sm text-muted">
                    Irreversible actions. Please proceed with caution. These actions may affect all active workflows in
                    this workspace.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 pt-2">
                    <Button
                      variant="secondary"
                      size="md"
                      className="rounded-lg border-red text-red"
                      onClick={() => setConfirmResetOpen(true)}
                      disabled={resetting}
                    >
                      {resetting ? "Resetting..." : "Reset workspace"}
                    </Button>
                    <Button variant="secondary" size="md" className="rounded-lg" onClick={onClearLocalCache}>
                      Clear local cache
                    </Button>
                  </div>
                </div>
              </section>
            </div>

            <div className="lg:col-span-5 flex flex-col gap-6">
              <section className="bg-panel border border-border rounded-xl shadow-soft overflow-hidden">
                <div className="px-6 py-5 border-b border-border">
                  <h3 className="text-lg font-semibold text-text">Preferences</h3>
                </div>
                <div className="p-6 space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-muted">Appearance</label>
                    <div className="flex items-center gap-2 bg-surface2 border border-border rounded-lg p-1">
                      <button
                        type="button"
                        className={`flex-1 h-9 rounded-md text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
                          theme === "light" ? "bg-panel shadow-soft text-text" : "text-muted hover:text-text"
                        }`}
                        onClick={() => setTheme("light")}
                      >
                        <Icon name="light_mode" className="text-[18px]" />
                        Light
                      </button>
                      <button
                        type="button"
                        className={`flex-1 h-9 rounded-md text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
                          theme === "dark" ? "bg-panel shadow-soft text-text" : "text-muted hover:text-text"
                        }`}
                        onClick={() => setTheme("dark")}
                      >
                        <Icon name="dark_mode" className="text-[18px]" />
                        Dark
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-sm font-medium text-muted">Reduce motion</div>
                      <div className="text-xs text-muted">Minimize interface animations</div>
                    </div>
                    <Toggle checked={reduceMotion} onChange={setReduceMotion} />
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-sm font-medium text-muted">Auto-save flows</div>
                      <div className="text-xs text-muted">Save changes automatically</div>
                    </div>
                    <Toggle checked={autoSaveFlows} onChange={setAutoSaveFlows} />
                  </div>
                </div>
              </section>

              <section className="bg-panel border border-border rounded-xl shadow-soft overflow-hidden">
                <div className="px-6 py-5 border-b border-border flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-text">Profile</h3>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-surface2 border border-border text-muted">
                    Signed in
                  </span>
                </div>
                <div className="p-6 flex items-center gap-4">
                  <div
                    className="size-12 rounded-full border border-border flex items-center justify-center font-bold"
                    style={profileAvatar}
                    title={profileEmail || profileName}
                  >
                    {initialsFor(profileName)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-text truncate">{profileName}</div>
                    <div className="text-xs text-muted truncate">{profileEmail || "—"}</div>
                  </div>
                  <div className="ml-auto flex items-center gap-3 text-sm">
                    <button
                      type="button"
                      className="text-muted hover:text-text"
                      onClick={() => showInfo("Profile", "Profile editing is coming soon.")}
                    >
                      Edit profile
                    </button>
                    <button
                      type="button"
                      className="text-red hover:underline"
                      onClick={onSignOut}
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              </section>

              <section className="bg-panel border border-border rounded-xl shadow-soft overflow-hidden">
                <div className="px-6 py-5 border-b border-border">
                  <h3 className="text-lg font-semibold text-text">System</h3>
                </div>
                <div className="p-6 space-y-3 text-sm">
                  <Row label="Version" value="v0.1.0-beta" />
                  <Row label="API base" value={API_BASE_URL} mono />
                  <Row label="Environment" value="Local" badgeTone="warning" />
                  <Row label="Temporal NS" value="default" mono />
                </div>
              </section>
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

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <div className="w-10 h-6 bg-surface2 border border-border rounded-full peer peer-checked:bg-accent relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-panel after:border after:border-border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-4" />
    </label>
  );
}

function Row({
  label,
  value,
  mono,
  badgeTone,
}: {
  label: string;
  value: string;
  mono?: boolean;
  badgeTone?: "default" | "success" | "warning" | "danger";
}) {
  const toneVar: Record<NonNullable<typeof badgeTone>, string> = {
    default: "var(--muted)",
    success: "var(--success)",
    warning: "var(--warning)",
    danger: "var(--error)",
  };
  const c = badgeTone ? toneVar[badgeTone] : "var(--text)";
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="text-xs text-muted uppercase tracking-wide">{label}</div>
      {badgeTone ? (
        <span
          className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium border"
          style={{
            background: `color-mix(in srgb, ${c} 14%, transparent)`,
            borderColor: `color-mix(in srgb, ${c} 24%, transparent)`,
            color: c,
          }}
        >
          {value}
        </span>
      ) : (
        <div className={`text-sm text-text truncate ${mono ? "font-mono text-xs" : ""}`}>{value}</div>
      )}
    </div>
  );
}
