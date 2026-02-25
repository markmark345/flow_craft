"use client";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";
import Link from "next/link";
import { useCredentialsPage } from "../../hooks/use-credentials-page";

type Props = {
  scope: "personal" | "project";
  project: ReturnType<typeof useCredentialsPage>["project"];
  headerTitle: string;
  isAdmin: boolean;
  menuOpen: boolean;
  setMenuOpen: (val: boolean | ((v: boolean) => boolean)) => void;
  menuRef: React.RefObject<HTMLDivElement | null>;
  projectNavItems: ReturnType<typeof useCredentialsPage>["projectNavItems"];
  onConnect: (provider: "google" | "github") => void;
};

export function CredentialsHeader({
  scope,
  project,
  headerTitle,
  isAdmin,
  menuOpen,
  setMenuOpen,
  menuRef,
  projectNavItems,
  onConnect,
}: Props) {
  return (
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
              <div className="text-xs text-muted mt-1">
                Only project admins can connect or disconnect credentials.
              </div>
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
              <Button
                variant="ghost"
                className="h-10 w-10 bg-accent text-white flex items-center justify-center border-l border-white/20 hover:bg-accentStrong rounded-none p-0 transition-colors"
                onClick={() => setMenuOpen((v) => !v)}
                disabled={!isAdmin}
                aria-label="Toggle credential menu"
              >
                <Icon
                  name="expand_more"
                  className={cn("text-[18px] transition-transform", menuOpen ? "rotate-180" : "")}
                />
              </Button>
            </div>
            {menuOpen ? (
              <div className="absolute right-0 mt-2 w-48 rounded-xl border border-border bg-panel shadow-lift overflow-hidden z-20">
                <Button
                  variant="ghost"
                  className="w-full flex items-center justify-start gap-2 px-4 py-3 h-auto text-sm text-text hover:bg-surface2 transition-colors rounded-none font-normal"
                  onClick={() => {
                    setMenuOpen(false);
                    onConnect("google");
                  }}
                >
                  <Icon name="google" className="text-[18px]" />
                  Connect Google
                </Button>
                <Button
                  variant="ghost"
                  className="w-full flex items-center justify-start gap-2 px-4 py-3 h-auto text-sm text-text hover:bg-surface2 transition-colors rounded-none font-normal"
                  onClick={() => {
                    setMenuOpen(false);
                    onConnect("github");
                  }}
                >
                  <Icon name="github" className="text-[18px]" />
                  Connect GitHub
                </Button>
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
  );
}
