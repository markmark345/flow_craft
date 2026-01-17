"use client";

import { CodeTabs } from "../../components/code-tabs";
import type { DocsPage } from "../docs-data-types";
import { prose, section } from "../docs-data-helpers";

export const TRIGGER_PAGES: Record<string, DocsPage> = {
  "/docs/builder/http-request": {
    title: "HTTP Request Node",
    breadcrumb: [
      { label: "Docs", href: "/docs" },
      { label: "Workflow Builder", href: "/docs/builder/overview" },
      { label: "HTTP Request" },
    ],
    description: "Call external APIs with method, headers, query parameters, and optional body.",
    sections: [
      section(
        "setup",
        "Setup",
        prose(
          <>
            <p>
              Set the <strong>URL</strong> and choose a method
              (GET/POST/PUT/DELETE). Add <strong>Query Parameters</strong> and{" "}
              <strong>Headers</strong> using the key/value editor.
            </p>
            <p>
              For POST/PUT, you can provide a JSON body. If the body looks like
              JSON, Content-Type is set to <code>application/json</code>{" "}
              automatically.
            </p>
          </>
        )
      ),
      section(
        "example",
        "Example: PokeAPI",
        <>
          <CodeTabs
            tabs={[
              {
                id: "example",
                label: "Config",
                code: `URL: https://pokeapi.co/api/v2/pokemon/ditto\nMethod: GET\nQuery: (empty)\nHeaders: (empty)\nBody: (empty)`,
              },
              {
                id: "curl",
                label: "cURL",
                code: `curl https://pokeapi.co/api/v2/pokemon/ditto`,
              },
            ]}
          />
        </>
      ),
      section(
        "debug",
        "Debugging",
        prose(
          <>
            <p>
              Use the Run detail page or the builder’s{" "}
              <strong>Input / Output</strong> tab to inspect the actual URL used
              (including query params) and the JSON output.
            </p>
          </>
        )
      ),
    ],
  },
  "/docs/builder/schedule": {
    title: "Schedule Node",
    breadcrumb: [
      { label: "Docs", href: "/docs" },
      { label: "Workflow Builder", href: "/docs/builder/overview" },
      { label: "Schedule" },
    ],
    description: "Run flows automatically using a schedule.",
    sections: [
      section(
        "picker",
        "Pick a schedule",
        prose(
          <>
            <p>
              Use the schedule picker (Every N minutes / Hourly / Daily / Weekly
              / Monthly). The UI generates a cron expression behind the scenes.
            </p>
            <p>
              For every minute: set <strong>Every N minutes</strong> to{" "}
              <code>1</code> (preview becomes <code>* * * * *</code>).
            </p>
          </>
        )
      ),
      section(
        "activate",
        "Activate the schedule",
        prose(
          <>
            <p>
              Schedules are executed by the <strong>worker</strong>. After
              configuring, click <strong>Save</strong> so the flow definition is
              stored in the API database.
            </p>
            <p>
              Keep the worker running (docker compose / `go run ./cmd/worker`).
              The worker refreshes schedules about every{" "}
              <strong>15 seconds</strong>, and the first run starts on the next
              minute boundary.
            </p>
          </>
        )
      ),
      section(
        "timezone",
        "Time zone",
        prose(
          <>
            <p>
              Scheduling uses the worker machine’s local time zone. In Docker,
              that is usually UTC unless you configure it differently.
            </p>
          </>
        )
      ),
    ],
  },
  "/docs/builder/webhook": {
    title: "Webhook Node",
    breadcrumb: [
      { label: "Docs", href: "/docs" },
      { label: "Workflow Builder", href: "/docs/builder/overview" },
      { label: "Webhook" },
    ],
    description: "Configure incoming webhooks (inbound trigger execution is coming soon).",
    sections: [
      section(
        "config",
        "Configuration",
        prose(
          <>
            <p>
              Set the webhook path and optional secret. Inbound webhook
              triggering is under development; for now the node produces a
              sample payload when the flow is run manually.
            </p>
          </>
        )
      ),
    ],
  },
  "/docs/builder/http-trigger": {
    title: "HTTP Trigger Node",
    breadcrumb: [
      { label: "Docs", href: "/docs" },
      { label: "Workflow Builder", href: "/docs/builder/overview" },
      { label: "HTTP Trigger" },
    ],
    description: "Start flows from HTTP requests (coming soon).",
    sections: [
      section(
        "status",
        "Status",
        prose(
          <>
            <p>
              The HTTP Trigger node is available in the builder and can be
              configured with a path and method. Inbound activation is coming
              soon; currently it behaves like a trigger step when you manually
              run a flow.
            </p>
          </>
        )
      ),
    ],
  },
};
