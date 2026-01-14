"use client";

import { Button } from "@/shared/components/button";
import { Input } from "@/shared/components/input";
import { Icon } from "@/shared/components/icon";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useBuilderTopbar } from "../hooks/use-builder-topbar";

export function BuilderTopbar() {
  const router = useRouter();
  const {
    user,
    signOut,
    signingOut,
    localName,
    setLocalName,
    menuOpen,
    setMenuOpen,
    menuRef,
    initials,
    saving,
    running,
    dirty,
    flowId,
    showInfo,
    save,
    onRun,
  } = useBuilderTopbar();

  return (
    <header className="h-14 px-4 border-b border-border bg-panel flex items-center justify-between shrink-0 shadow-soft">
      <div className="flex items-center gap-4 min-w-0">
        <Link
          href="/flows"
          className="text-muted hover:text-text transition-colors rounded-md p-1.5 hover:bg-surface2"
          title="Back"
          aria-label="Back"
        >
          <Icon name="arrow_back" className="text-[20px]" />
        </Link>
        <div className="h-6 w-px bg-border" />
        <div className="flex items-center gap-2 min-w-0">
          <Input
            value={localName}
            onChange={(e) => setLocalName(e.target.value)}
            className="h-9 w-[360px] max-w-[50vw] bg-transparent border-transparent hover:border-border focus:border-border px-2 font-semibold"
          />
          <span className="px-2.5 py-0.5 bg-surface2 text-muted text-[11px] font-bold uppercase tracking-wide rounded-full border border-border">
            Draft
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center bg-surface2 rounded-lg p-0.5 border border-border">
          <button
            type="button"
            className="p-1.5 rounded-md hover:bg-surface shadow-soft hover:shadow text-muted transition-all disabled:opacity-50"
            title="Undo"
            onClick={() => showInfo("Undo", "Undo/redo is coming soon.")}
          >
            <Icon name="undo" className="text-[20px]" />
          </button>
          <div className="w-px h-4 bg-border mx-0.5" />
          <button
            type="button"
            className="p-1.5 rounded-md hover:bg-surface shadow-soft hover:shadow text-muted transition-all disabled:opacity-50"
            title="Redo"
            onClick={() => showInfo("Redo", "Undo/redo is coming soon.")}
          >
            <Icon name="redo" className="text-[20px]" />
          </button>
        </div>

        <Button variant="secondary" size="sm" title="Versions" onClick={() => showInfo("Versions", "Version history is coming soon.")}>
          <Icon name="history" className="text-[18px] mr-1.5" />
          Versions
        </Button>

        <Button variant="secondary" size="sm" onClick={onRun} disabled={!flowId || saving || running}>
          <Icon name="play_arrow" className="text-[18px] mr-1.5" />
          {running ? "Running..." : "Run"}
        </Button>

        <Button size="sm" onClick={() => void save()} disabled={saving || !dirty}>
          <Icon name="save" className="text-[18px] mr-1.5" />
          {saving ? "Saving..." : "Save"}
        </Button>

        <div className="relative ml-2" ref={menuRef}>
          <button
            type="button"
            className="h-9 w-9 rounded-full bg-surface2 border border-border flex items-center justify-center text-xs font-bold text-muted hover:text-text hover:bg-surface transition-colors"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Account menu"
            title={user?.email || "Account"}
          >
            {initials}
          </button>

          {menuOpen ? (
            <div className="absolute right-0 top-full mt-2 w-60 rounded-xl border border-border bg-panel shadow-lift overflow-hidden z-50">
              <div className="px-4 py-3">
                <div className="text-sm font-semibold text-text truncate">{user?.name || "User"}</div>
                <div className="text-xs text-muted truncate">{user?.email || ""}</div>
              </div>
              <div className="h-px bg-border" />
              <Link
                href="/settings"
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-muted hover:bg-surface2 hover:text-text transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                <Icon name="settings" className="text-[18px]" />
                Settings
              </Link>
              <button
                type="button"
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-muted hover:bg-surface2 hover:text-text transition-colors disabled:opacity-60"
                onClick={async () => {
                  await signOut();
                  setMenuOpen(false);
                  router.replace("/login");
                }}
                disabled={signingOut}
              >
                <Icon name="arrow_back" className="text-[18px] rotate-180" />
                Log out
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
