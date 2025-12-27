"use client";

import type { DocsNavGroup } from "./docs-data-types";

export const DOCS_NAV: DocsNavGroup[] = [
  {
    label: "Getting Started",
    items: [
      { label: "Introduction", href: "/docs/introduction", icon: "dashboard" },
      { label: "Authentication", href: "/docs/authentication", icon: "person" },
      {
        label: "Errors & Rate Limits",
        href: "/docs/errors-rate-limits",
        icon: "warning",
      },
    ],
  },
  {
    label: "Resources",
    items: [
      {
        label: "Workflows",
        href: "/docs/resources/workflows",
        icon: "account_tree",
      },
      {
        label: "Executions",
        href: "/docs/resources/executions",
        icon: "play_circle",
      },
      { label: "Triggers", href: "/docs/resources/triggers", icon: "bolt" },
    ],
  },
  {
    label: "Workflow Builder",
    items: [
      { label: "Overview", href: "/docs/builder/overview", icon: "grid_view" },
      {
        label: "HTTP Request",
        href: "/docs/builder/http-request",
        icon: "arrow_forward",
      },
      {
        label: "Action in an app",
        href: "/docs/builder/app-action",
        icon: "grid_view",
      },
      { label: "Schedule", href: "/docs/builder/schedule", icon: "schedule" },
      { label: "Webhook", href: "/docs/builder/webhook", icon: "data_object" },
      {
        label: "HTTP Trigger",
        href: "/docs/builder/http-trigger",
        icon: "bolt",
      },
      { label: "Slack", href: "/docs/builder/slack", icon: "terminal" },
      { label: "Run JS", href: "/docs/builder/run-js", icon: "terminal" },
      {
        label: "Database",
        href: "/docs/builder/database",
        icon: "data_object",
      },
      { label: "Delay", href: "/docs/builder/delay", icon: "schedule" },
      { label: "Filter", href: "/docs/builder/filter", icon: "filter_list" },
      { label: "Merge", href: "/docs/builder/merge", icon: "view_list" },
      { label: "Switch", href: "/docs/builder/switch", icon: "view_list" },
    ],
  },
  {
    label: "Developers",
    items: [
      {
        label: "Webhooks",
        href: "/docs/developers/webhooks",
        icon: "data_object",
      },
      {
        label: "SDKs & Libraries",
        href: "/docs/developers/sdks",
        icon: "terminal",
      },
    ],
  },
];

export const DOCS_FOOTER_LINKS = [
  { label: "Support Center", href: "/docs/support", icon: "help" },
  { label: "Changelog", href: "/docs/changelog", icon: "history" },
];

export const DOCS_ORDER: string[] = DOCS_NAV.flatMap((g) =>
  g.items.map((i) => i.href)
);
