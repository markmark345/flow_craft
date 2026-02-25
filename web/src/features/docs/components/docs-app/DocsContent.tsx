"use client";

import Link from "next/link";
import type { Route } from "next";
import { Icon } from "@/components/ui/icon";
import { getDocsPage } from "../../lib/docs-data";
import { DocsPage, DocsSection } from "../../lib/docs-data-types";

type Props = {
  page: DocsPage;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  previousHref: string | undefined;
  nextHref: string | undefined;
};

export function DocsContent({ page, scrollRef, previousHref, nextHref }: Props) {
  return (
    <main ref={scrollRef} className="flex-1 overflow-y-auto">
      <div className="max-w-[1100px] mx-auto px-6 lg:px-10 py-10">
        <div className="flex items-center gap-2 text-sm text-muted">
          {page.breadcrumb.map((b, idx: number) => (
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
          {page.sections.map((section: DocsSection) => (
            <section key={section.id} id={section.id} className="scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-2xl font-bold">{section.title}</h2>
                {section.badge ? (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-surface2 border border-border text-accent">
                    {section.badge}
                  </span>
                ) : null}
              </div>
              <div className="space-y-4">{section.content}</div>
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
  );
}
