"use client";

import { getErrorMessage } from "@/lib/error-utils";

import type { ReactNode } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Icon } from "@/components/ui/icon";
import { IconButton } from "@/components/ui/icon-button";
import { useAppStore } from "@/hooks/use-app-store";
import type { DocsSection } from "./docs-data-types";

export function section(
  id: string,
  title: string,
  content: ReactNode,
  badge?: string
): DocsSection {
  return { id, title, content, badge };
}

export function prose(children: ReactNode) {
  return (
    <div className="text-sm text-muted leading-relaxed space-y-3">
      {children}
    </div>
  );
}

export function EndpointList({ endpoints }: { endpoints: string[] }) {
  return (
    <div className="bg-surface2 rounded-xl border border-border overflow-hidden">
      <div className="px-4 py-3 border-b border-border text-xs font-bold uppercase tracking-wider text-muted">
        Endpoints
      </div>
      <ul className="p-4 space-y-1 font-mono text-xs text-text">
        {endpoints.map((e) => (
          <li key={e}>{e}</li>
        ))}
      </ul>
    </div>
  );
}

export function DocCard({
  href,
  title,
  description,
  icon,
  tone,
}: {
  href: string;
  title: string;
  description: string;
  icon: string;
  tone: "accent" | "success" | "warning" | "neutral";
}) {
  const toneVar: Record<typeof tone, string> = {
    accent: "var(--accent)",
    success: "var(--success)",
    warning: "var(--warning)",
    neutral: "var(--muted)",
  };
  const c = toneVar[tone] || "var(--accent)";
  return (
    <Link
      href={href as Route}
      className="group block p-6 bg-surface2 rounded-xl border border-border hover:border-[color-mix(in_srgb,var(--accent)_50%,transparent)] transition-all"
    >
      <div className="flex items-center justify-between mb-4">
        <div
          className="p-2 rounded-lg border"
          style={{
            background: `color-mix(in srgb, ${c} 12%, transparent)`,
            borderColor: `color-mix(in srgb, ${c} 20%, transparent)`,
            color: c,
          }}
        >
          <Icon name={icon} className="text-[18px]" />
        </div>
        <span className="text-muted group-hover:translate-x-1 transition-transform">
          <Icon name="arrow_forward" className="text-[18px]" />
        </span>
      </div>
      <div className="text-lg font-bold text-text mb-1 flex items-center gap-2">
        {title}
      </div>
      <div className="text-sm text-muted">{description}</div>
    </Link>
  );
}

export function SdkCard({
  title,
  hint,
  icon,
  tone,
}: {
  title: string;
  hint: string;
  icon: string;
  tone: "accent" | "success" | "warning";
}) {
  const toneVar: Record<typeof tone, string> = {
    accent: "var(--accent)",
    success: "var(--success)",
    warning: "var(--warning)",
  };
  const c = toneVar[tone] || "var(--accent)";
  return (
    <div className="flex items-center gap-4 p-4 rounded-lg bg-surface2 border border-border">
      <div
        className="size-10 rounded flex items-center justify-center shrink-0 border"
        style={{
          background: `color-mix(in srgb, ${c} 12%, transparent)`,
          borderColor: `color-mix(in srgb, ${c} 20%, transparent)`,
          color: c,
        }}
      >
        <Icon name={icon} className="text-[18px]" />
      </div>
      <div>
        <h4 className="font-bold text-text">{title}</h4>
        <div className="text-xs text-accent font-mono">{hint}</div>
      </div>
    </div>
  );
}

export function CopyIconButton({ value }: { value: string }) {
  const showSuccess = useAppStore((s) => s.showSuccess);
  const showError = useAppStore((s) => s.showError);
  return (
    <IconButton
      icon="content_copy"
      className="size-7 rounded-md text-muted hover:text-accent hover:bg-surface transition-colors"
      title="Copy"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          showSuccess("Copied");
        } catch (err: unknown) {
          showError("Copy failed", getErrorMessage(err) || "Unable to copy");
        }
      }}
    />
  );
}
