"use client";

import type { DocsPage } from "./docs-data-types";
import { prose, section } from "./docs-data-helpers";

export const SUPPORT_PAGES: Record<string, DocsPage> = {
  "/docs/support": {
    title: "Support Center",
    breadcrumb: [{ label: "Docs", href: "/docs" }, { label: "Support Center" }],
    description: "Need help? Start here.",
    sections: [
      section(
        "help",
        "Get help",
        prose(
          <>
            <p>
              For now, support is handled in-project. Create an issue in your
              repository or contact the maintainers.
            </p>
          </>
        )
      ),
    ],
  },
  "/docs/changelog": {
    title: "Changelog",
    breadcrumb: [{ label: "Docs", href: "/docs" }, { label: "Changelog" }],
    description: "What changed in recent versions.",
    sections: [
      section(
        "recent",
        "Recent changes",
        prose(
          <>
            <p>
              - Added schedule picker UI and worker-based scheduling.
              <br />- Added HTTP Request headers/query param editor.
              <br />- Added run progress highlighting in builder.
            </p>
          </>
        )
      ),
    ],
  },
};
