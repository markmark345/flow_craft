"use client";

import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/icon";
import { DocsPage, DocsSection } from "../../lib/docs-data-types";

type Props = {
  page: DocsPage;
  activeSectionId: string | undefined;
};

export function DocsOnThisPage({ page, activeSectionId }: Props) {
  return (
    <aside className="w-64 shrink-0 border-l border-border bg-surface2 overflow-y-auto hidden xl:block p-6">
      <div className="sticky top-0">
        <h4 className="text-xs font-bold uppercase tracking-wider text-text mb-4">On this page</h4>
        <nav className="flex flex-col space-y-3 border-l border-border">
          {page.sections.map((section: DocsSection) => {
            const isActive = section.id === activeSectionId;
            return (
              <a
                key={section.id}
                href={`#${section.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  const el = document.getElementById(section.id);
                  el?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className={cn(
                  "block pl-4 text-sm transition-colors -ml-px",
                  isActive
                    ? "text-accent font-semibold border-l-2 border-accent"
                    : "text-muted hover:text-text"
                )}
              >
                {section.title}
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
  );
}
