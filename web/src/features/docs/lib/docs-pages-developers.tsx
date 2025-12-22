"use client";

import { CodeTabs } from "../components/code-tabs";
import type { DocsPage } from "./docs-data-types";
import { prose, section } from "./docs-data-helpers";

export const DEVELOPERS_PAGES: Record<string, DocsPage> = {
  "/docs/developers/webhooks": {
    title: "Webhooks (Developer Guide)",
    breadcrumb: [
      { label: "Docs", href: "/docs" },
      { label: "Developers", href: "/docs/developers/webhooks" },
      { label: "Webhooks" },
    ],
    description:
      "Integrate external systems with your workflows (coming soon).",
    sections: [
      section(
        "overview",
        "Overview",
        prose(
          <>
            <p>
              Incoming webhooks will allow you to trigger runs from external
              systems. The UI and node configuration exist today, and the
              server-side trigger execution is under development.
            </p>
          </>
        )
      ),
    ],
  },
  "/docs/developers/sdks": {
    title: "SDKs & Libraries",
    breadcrumb: [
      { label: "Docs", href: "/docs" },
      { label: "Developers", href: "/docs/developers/sdks" },
      { label: "SDKs & Libraries" },
    ],
    description: "Client libraries and examples (placeholders).",
    sections: [
      section(
        "node",
        "Node.js",
        <CodeTabs
          tabs={[
            { id: "npm", label: "Install", code: "npm install flowcraft" },
          ]}
        />
      ),
      section(
        "python",
        "Python",
        <CodeTabs
          tabs={[
            { id: "pip", label: "Install", code: "pip install flowcraft" },
          ]}
        />
      ),
      section(
        "go",
        "Go",
        <CodeTabs
          tabs={[{ id: "go", label: "Install", code: "go get flowcraft" }]}
        />
      ),
    ],
  },
};
