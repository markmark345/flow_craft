"use client";

import type { DocsPage } from "./docs-data-types";
import { DOCS_FOOTER_LINKS, DOCS_NAV, DOCS_ORDER } from "./docs-data-nav";
import { GETTING_STARTED_PAGES } from "./docs-pages-getting-started";
import { RESOURCES_PAGES } from "./docs-pages-resources";
import { BUILDER_PAGES } from "./docs-pages-builder";
import { DEVELOPERS_PAGES } from "./docs-pages-developers";
import { SUPPORT_PAGES } from "./docs-pages-support";

export type { DocsNavItem, DocsNavGroup, DocsSection, DocsPage } from "./docs-data-types";
export { DOCS_NAV, DOCS_FOOTER_LINKS, DOCS_ORDER } from "./docs-data-nav";

const PAGES: Record<string, DocsPage> = {
  ...GETTING_STARTED_PAGES,
  ...RESOURCES_PAGES,
  ...BUILDER_PAGES,
  ...DEVELOPERS_PAGES,
  ...SUPPORT_PAGES,
};

export function getDocsPage(href: string): DocsPage | undefined {
  return PAGES[href];
}
