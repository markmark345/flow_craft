"use client";

import Link from "next/link";
import type { Route } from "next";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "../theme-toggle";
import { UserDTO } from "@/types/dto";
import { useRouter } from "next/navigation";

type Props = {
  query: string;
  setQuery: (val: string) => void;
  user: UserDTO | undefined;
  signOut: () => Promise<void>;
  signingOut: boolean;
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  menuRef: React.RefObject<HTMLDivElement>;
  initials: string;
  router: ReturnType<typeof useRouter>;
};

export function DocsHeader({
  query,
  setQuery,
  user,
  signOut,
  signingOut,
  menuOpen,
  setMenuOpen,
  menuRef,
  initials,
  router,
}: Props) {
  return (
    <header className="h-16 shrink-0 border-b border-border bg-panel px-6 flex items-center justify-between">
      <div className="flex items-center gap-8 min-w-0">
        <Link href={"/docs/introduction" as Route} className="flex items-center gap-3 shrink-0">
          <div
            className="size-8 rounded-lg flex items-center justify-center text-white"
            style={{ background: "var(--grad-accent)" }}
          >
            <Icon name="data_object" className="text-[18px]" />
          </div>
          <div className="text-lg font-bold tracking-tight min-w-0">
            FlowCraft <span className="text-accent font-normal">Docs</span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-surface2 rounded-lg border border-transparent focus-within:border-[color-mix(in_srgb,var(--accent)_45%,transparent)] transition-colors w-[420px] max-w-[52vw]">
          <Icon name="search" className="text-muted text-[18px]" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search docs, endpoints..."
            className="h-8 bg-transparent border-none focus:shadow-none px-0"
          />
          <kbd className="hidden lg:inline-flex h-6 items-center rounded border border-border bg-panel px-2 font-mono text-[11px] text-muted">
            Ctrl K
          </kbd>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          className="hidden sm:inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-text h-auto p-0 hover:bg-transparent"
        >
          v2.0 <Icon name="expand_more" className="text-[18px]" />
        </Button>
        <div className="hidden sm:block h-6 w-px bg-border" />
        <ThemeToggle />
        <Link
          href="/settings"
          className="inline-flex items-center justify-center size-9 rounded-lg text-muted hover:text-text hover:bg-surface2 transition-colors"
          title="Settings"
        >
          <Icon name="settings" className="text-[18px]" />
        </Link>
        <div className="relative" ref={menuRef}>
          <Button
            variant="ghost"
            className="inline-flex items-center justify-center size-9 rounded-full border border-border bg-surface2 text-xs font-bold text-muted hover:text-text hover:bg-surface transition-colors p-0"
            title={user?.email || "Account"}
            aria-label="Account menu"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {initials}
          </Button>
          {menuOpen ? (
            <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-border bg-panel shadow-lift overflow-hidden z-50">
              <div className="px-4 py-3">
                <div className="text-sm font-semibold text-text truncate">{user?.name || "User"}</div>
                <div className="text-xs text-muted truncate">{user?.email || ""}</div>
              </div>
              <div className="h-px bg-border" />
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 px-4 py-2.5 h-auto text-sm text-muted hover:bg-surface2 hover:text-text font-normal rounded-none"
                onClick={async () => {
                  await signOut();
                  setMenuOpen(false);
                  router.replace("/login");
                }}
                disabled={signingOut}
              >
                <Icon name="arrow_back" className="text-[18px] rotate-180" />
                Log out
              </Button>
            </div>
          ) : null}
        </div>
        <Link href="/" className="hidden sm:inline-flex">
          <Button size="sm">Dashboard</Button>
        </Link>
      </div>
    </header>
  );
}
