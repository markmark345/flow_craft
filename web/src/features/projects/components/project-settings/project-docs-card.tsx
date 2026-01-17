"use client";

import Link from "next/link";

import { Icon } from "@/components/ui/icon";

type DocLink = {
  href: string;
  label: string;
  icon: string;
};

export function ProjectDocsCard({ links }: { links: DocLink[] }) {
  return (
    <section className="bg-panel border border-border rounded-xl shadow-soft p-6">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">Documentation</h3>
      <ul className="mt-4 space-y-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href as any} className="flex items-center gap-2 text-sm text-accent hover:underline">
              <Icon name={link.icon} className="text-[16px]" />
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
