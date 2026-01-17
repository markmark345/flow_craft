"use client";

import type { DocsPage } from "./docs-data-types";
import { OVERVIEW_PAGES } from "./builder/overview";
import { TRIGGER_PAGES } from "./builder/triggers";
import { LOGIC_PAGES } from "./builder/logic";
import { SIMULATED_PAGES } from "./builder/simulated";

export const BUILDER_PAGES: Record<string, DocsPage> = {
  ...OVERVIEW_PAGES,
  ...TRIGGER_PAGES,
  ...LOGIC_PAGES,
  ...SIMULATED_PAGES,
};
