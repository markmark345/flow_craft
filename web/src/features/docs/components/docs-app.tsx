"use client";

import Link from "next/link";
import type { Route } from "next";
import { useDocsApp } from "../hooks/use-docs-app";
import { DocsHeader } from "./docs-app/DocsHeader";
import { DocsSidebar } from "./docs-app/DocsSidebar";
import { DocsContent } from "./docs-app/DocsContent";
import { DocsOnThisPage } from "./docs-app/DocsOnThisPage";

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
      <DocsHeader
        router={router}
        query={query}
        setQuery={setQuery}
        user={user}
        signOut={signOut}
        signingOut={signingOut}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        menuRef={menuRef}
        initials={initials}
      />

      <div className="flex flex-1 overflow-hidden">
        <DocsSidebar filteredNav={filteredNav} href={href} />

        <DocsContent
          page={page}
          scrollRef={scrollRef}
          previousHref={previousHref}
          nextHref={nextHref}
        />

        <DocsOnThisPage page={page} activeSectionId={activeSectionId} />
      </div>
    </div>
  );
}
