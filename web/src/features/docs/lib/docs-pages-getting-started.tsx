"use client";

import type { DocsPage } from "./docs-data-types";
import { introductionPage } from "./getting-started/introduction";
import { authenticationPage } from "./getting-started/authentication";
import { errorsRateLimitsPage } from "./getting-started/errors-rate-limits";

export const GETTING_STARTED_PAGES: Record<string, DocsPage> = {
  "/docs/introduction": introductionPage,
  "/docs/authentication": authenticationPage,
  "/docs/errors-rate-limits": errorsRateLimitsPage,
};

