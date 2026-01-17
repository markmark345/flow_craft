"use client";

import type { DocsPage } from "../docs-data-types";
import { prose, section } from "../docs-data-helpers";

export const SIMULATED_PAGES: Record<string, DocsPage> = {
  "/docs/builder/slack": {
    title: "Slack Node",
    breadcrumb: [
      { label: "Docs", href: "/docs" },
      { label: "Workflow Builder", href: "/docs/builder/overview" },
      { label: "Slack" },
    ],
    description: "Send notifications to Slack (UI demo; delivery is simulated).",
    sections: [
      section(
        "setup",
        "Setup",
        prose(
          <>
            <p>
              Select action type and a connection, then set channel and message.
              The Slack node validates required fields and shows “Configured”
              when ready.
            </p>
          </>
        )
      ),
      section(
        "notes",
        "Notes",
        prose(
          <>
            <p>
              Slack delivery is currently simulated during execution. Connector
              management is planned for a future milestone.
            </p>
          </>
        )
      ),
    ],
  },
  "/docs/builder/run-js": {
    title: "Run JS Node",
    breadcrumb: [
      { label: "Docs", href: "/docs" },
      { label: "Workflow Builder", href: "/docs/builder/overview" },
      { label: "Run JS" },
    ],
    description: "Run custom JavaScript (simulated execution).",
    sections: [
      section(
        "script",
        "Script",
        prose(
          <>
            <p>
              Write your script in the node configuration. Execution is
              simulated for now; a full JS runtime and data passing are planned.
            </p>
          </>
        )
      ),
    ],
  },
  "/docs/builder/database": {
    title: "Database Node",
    breadcrumb: [
      { label: "Docs", href: "/docs" },
      { label: "Workflow Builder", href: "/docs/builder/overview" },
      { label: "Database" },
    ],
    description: "Run a database query (simulated execution).",
    sections: [
      section(
        "query",
        "Query",
        prose(
          <>
            <p>
              Provide a SQL query. Execution is simulated for now; connection
              configuration and real querying are planned.
            </p>
          </>
        )
      ),
    ],
  },
  "/docs/builder/delay": {
    title: "Delay Node",
    breadcrumb: [
      { label: "Docs", href: "/docs" },
      { label: "Workflow Builder", href: "/docs/builder/overview" },
      { label: "Delay" },
    ],
    description: "Wait before continuing (simulated).",
    sections: [
      section(
        "config",
        "Configuration",
        prose(
          <>
            <p>
              Set the delay duration in seconds. Execution is simulated to keep
              runs responsive in local development.
            </p>
          </>
        )
      ),
    ],
  },
};
