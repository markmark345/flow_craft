"use client";

import type { ReactNode } from "react";

export type DocsNavItem = {
  label: string;
  href: string;
  icon: string;
};

export type DocsNavGroup = {
  label: string;
  items: DocsNavItem[];
};

export type DocsSection = {
  id: string;
  title: string;
  badge?: string;
  content: ReactNode;
};

export type DocsPage = {
  title: string;
  subtitle?: string;
  breadcrumb: Array<{ label: string; href?: string }>;
  description?: string;
  sections: DocsSection[];
};
