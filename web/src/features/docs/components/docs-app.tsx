"use client";

import Link from "next/link";
import type { Route } from "next";
import { cn } from "@/shared/lib/cn";
import { Icon } from "@/shared/components/icon";
import { Button } from "@/shared/components/button";
import { Input } from "@/shared/components/input";
import { DOCS_FOOTER_LINKS, getDocsPage } from "../lib/docs-data";
import { ThemeToggle } from "./theme-toggle";
import { useDocsApp } from "../hooks/use-docs-app";

export function DocsApp({ href }: { href: string }) {
  const {
    router,
    page,
    query,
    setQuery,
    activeSectionId,
    scrollRef,
    user,
    signOut,
    signingOut,
    menuOpen,
    setMenuOpen,
    menuRef,
    initials,
    filteredNav,
    previousHref,
    nextHref,
  } = useDocsApp(href);

  if (!page) {
    return (
      <div className="min-h-screen bg-bg text-text flex items-center justify-center p-8">
        <div className="max-w-md w-full bg-panel border border-border rounded-xl p-6 shadow-soft">
          <div className="text-lg font-bold mb-2">Docs page not found</div>
          <div className="text-sm text-muted mb-4">The requested page does not exist.</div>
          <Link href={"/docs/introduction" as Route} className="text-accent hover:underline text-sm font-medium">
            Go to Introduction
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-bg text-text">
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
          <button
            type="button"
            className="hidden sm:inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-text transition-colors"
          >
            v2.0 <Icon name="expand_more" className="text-[18px]" />
          </button>
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
            <button
              type="button"
              className="inline-flex items-center justify-center size-9 rounded-full border border-border bg-surface2 text-xs font-bold text-muted hover:text-text hover:bg-surface transition-colors"
              title={user?.email || "Account"}
              aria-label="Account menu"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {initials}
            </button>
            {menuOpen ? (
              <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-border bg-panel shadow-lift overflow-hidden z-50">
                <div className="px-4 py-3">
                  <div className="text-sm font-semibold text-text truncate">{user?.name || "User"}</div>
                  <div className="text-xs text-muted truncate">{user?.email || ""}</div>
                </div>
                <div className="h-px bg-border" />
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
          <Link href="/" className="hidden sm:inline-flex">
            <Button size="sm">Dashboard</Button>
          </Link>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 shrink-0 border-r border-border bg-surface2 overflow-y-auto hidden lg:flex flex-col">
          <nav className="flex-1 p-4 space-y-8">
            {filteredNav.map((group) => (
              <div key={group.label}>
                <h3 className="px-3 text-xs font-bold text-muted uppercase tracking-wider mb-2">{group.label}</h3>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const isActive = item.href === href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href as Route}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium",
                          isActive ? "text-accent" : "text-muted hover:text-text hover:bg-panel"
                        )}
                        style={
                          isActive
                            ? { background: "color-mix(in srgb, var(--accent) 12%, transparent)" }
                            : undefined
                        }
                      >
                        <Icon
                          name={item.icon}
                          className={cn("text-[18px]", isActive ? "text-accent" : "text-muted")}
                        />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="p-4 border-t border-border space-y-2">
            {DOCS_FOOTER_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href as Route}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted hover:text-text hover:bg-panel transition-colors text-sm font-medium"
              >
                <Icon name={item.icon} className="text-[18px]" />
                <span className="truncate">{item.label}</span>
              </Link>
            ))}
          </div>
        </aside>

        <main ref={scrollRef} className="flex-1 overflow-y-auto">
          <div className="max-w-[1100px] mx-auto px-6 lg:px-10 py-10">
              <div className="flex items-center gap-2 text-sm text-muted">
                {page.breadcrumb.map((b, idx) => (
                  <span key={`${b.label}-${idx}`} className="flex items-center gap-2">
                    {idx > 0 ? <Icon name="chevron_right" className="text-[16px] text-muted" /> : null}
                    {b.href ? (
                      <Link href={b.href as Route} className="hover:text-text transition-colors">
                        {b.label}
                      </Link>
                    ) : (
                    <span className="text-text">{b.label}</span>
                  )}
                </span>
              ))}
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight mt-4">{page.title}</h1>
            {page.description ? <p className="text-muted mt-3 max-w-[70ch]">{page.description}</p> : null}

            <div className="mt-10 space-y-16">
              {page.sections.map((s) => (
                <section key={s.id} id={s.id} className="scroll-mt-24">
                  <div className="flex items-center gap-3 mb-4">
                    <h2 className="text-2xl font-bold">{s.title}</h2>
                    {s.badge ? (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-surface2 border border-border text-accent">
                        {s.badge}
                      </span>
                    ) : null}
                  </div>
                  <div className="space-y-4">{s.content}</div>
                </section>
              ))}
            </div>

            <div className="flex items-center justify-between pt-12 border-t border-border mt-12">
              {previousHref ? (
                <Link href={previousHref as Route} className="group flex flex-col gap-1">
                  <span className="text-xs text-muted uppercase tracking-wider">Previous</span>
                  <span className="flex items-center gap-2 font-semibold group-hover:text-accent transition-colors">
                    <Icon name="arrow_back" className="text-[18px]" />
                    {getDocsPage(previousHref)?.title ?? "Previous"}
                  </span>
                </Link>
              ) : (
                <span />
              )}

              {nextHref ? (
                <Link href={nextHref as Route} className="group flex flex-col gap-1 items-end text-right">
                  <span className="text-xs text-muted uppercase tracking-wider">Next</span>
                  <span className="flex items-center gap-2 font-semibold group-hover:text-accent transition-colors">
                    {getDocsPage(nextHref)?.title ?? "Next"}
                    <Icon name="arrow_forward" className="text-[18px]" />
                  </span>
                </Link>
              ) : null}
            </div>
          </div>
        </main>

        <aside className="w-64 shrink-0 border-l border-border bg-surface2 overflow-y-auto hidden xl:block p-6">
          <div className="sticky top-0">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text mb-4">On this page</h4>
            <nav className="flex flex-col space-y-3 border-l border-border">
              {page.sections.map((s) => {
                const isActive = s.id === activeSectionId;
                return (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      const el = document.getElementById(s.id);
                      el?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                    className={cn(
                      "block pl-4 text-sm transition-colors -ml-px",
                      isActive
                        ? "text-accent font-semibold border-l-2 border-accent"
                        : "text-muted hover:text-text"
                    )}
                  >
                    {s.title}
                  </a>
                );
              })}
            </nav>

            <div className="mt-8 pt-6 border-t border-border">
              <h5 className="text-xs font-semibold text-muted mb-3">Community</h5>
              <div className="flex flex-col gap-3">
                <a
                  className="flex items-center gap-2 text-sm text-muted hover:text-accent transition-colors"
                  href="#"
                >
                  <Icon name="help" className="text-[16px]" />
                  Join our Discord
                </a>
                <a
                  className="flex items-center gap-2 text-sm text-muted hover:text-accent transition-colors"
                  href="#"
                >
                  <Icon name="github" className="text-[16px]" />
                  GitHub Repository
                </a>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
