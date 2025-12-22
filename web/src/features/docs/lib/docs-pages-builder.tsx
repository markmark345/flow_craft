"use client";

import { CodeTabs } from "../components/code-tabs";
import type { DocsPage } from "./docs-data-types";
import { prose, section } from "./docs-data-helpers";

export const BUILDER_PAGES: Record<string, DocsPage> = {
  "/docs/builder/overview": {
    title: "Workflow Builder Overview",
    breadcrumb: [
      { label: "Docs", href: "/docs" },
      { label: "Workflow Builder", href: "/docs/builder/overview" },
      { label: "Overview" },
    ],
    description: "Build, run, and debug workflows using the visual builder.",
    sections: [
      section(
        "create",
        "Create a flow",
        prose(
          <>
            <p>
              Create nodes by dragging from the palette. Connect nodes by
              dragging from the right handle to the next node’s left handle.
            </p>
            <p>
              Use <strong>Save</strong> to persist changes. Some actions (like
              Schedule) require the flow to be saved to become active.
            </p>
          </>
        )
      ),
      section(
        "run",
        "Run and inspect",
        prose(
          <>
            <p>
              Click <strong>Run</strong> to execute the flow. Running
              nodes/edges are highlighted; completed nodes show a status badge.
            </p>
            <p>
              In the Inspector: open <strong>Input / Output</strong> to see step
              inputs and outputs. Selecting an edge shows I/O on both sides of
              the connection.
            </p>
          </>
        )
      ),
      section(
        "edges",
        "Edges",
        prose(
          <>
            <p>
              Edges determine the order of execution. You can delete an edge by
              selecting it and pressing <code>Delete</code>/
              <code>Backspace</code>, or double-click it.
            </p>
          </>
        )
      ),
    ],
  },
  "/docs/builder/http-request": {
    title: "HTTP Request Node",
    breadcrumb: [
      { label: "Docs", href: "/docs" },
      { label: "Workflow Builder", href: "/docs/builder/overview" },
      { label: "HTTP Request" },
    ],
    description:
      "Call external APIs with method, headers, query parameters, and optional body.",
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
    description:
      "Configure incoming webhooks (inbound trigger execution is coming soon).",
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
  "/docs/builder/slack": {
    title: "Slack Node",
    breadcrumb: [
      { label: "Docs", href: "/docs" },
      { label: "Workflow Builder", href: "/docs/builder/overview" },
      { label: "Slack" },
    ],
    description:
      "Send notifications to Slack (UI demo; delivery is simulated).",
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
  "/docs/builder/filter": {
    title: "Filter (If) Node",
    breadcrumb: [
      { label: "Docs", href: "/docs" },
      { label: "Workflow Builder", href: "/docs/builder/overview" },
      { label: "Filter" },
    ],
    description: "Branch your workflow based on a condition.",
    sections: [
      section(
        "branches",
        "Branches",
        prose(
          <>
            <p>
              The Filter node has <code>true</code> and <code>false</code>{" "}
              outputs. Use it to split the flow into different paths.
            </p>
          </>
        )
      ),
      section(
        "condition",
        "Condition",
        prose(
          <>
            <p>
              Build conditions using the left/right fields and the operator
              menu. The Filter node evaluates conditions at runtime and routes
              the flow to the <code>true</code> or <code>false</code> branch.
            </p>
            <p>
              The condition input is the <strong>previous node output</strong>.
              You can reference fields using dot paths like{" "}
              <code>input.status</code> or <code>input.data.name</code>. You
              can also use the shorthand <code>data.name</code> for the left
              side.
            </p>
            <p>
              Right-side values are treated as literals unless you wrap them in{" "}
              <code>{"{{ ... }}"}</code> or start with <code>input.</code>. Use
              that when you want to compare two fields.
            </p>
            <p>
              To compare with other steps, use{" "}
              <code>steps.&lt;nodeId&gt;.&lt;field&gt;</code>. The node ID is
              shown in the inspector (e.g. <code>node_2c0a8</code>). Example:{" "}
              <code>steps.node_2c0a8.data.name</code>. For the right side, wrap
              it in <code>{"{{ ... }}"}</code>.
            </p>
          </>
        )
      ),
      section(
        "examples",
        "Examples",
        <>
          <CodeTabs
            tabs={[
              {
                id: "ditto",
                label: "PokeAPI (name)",
                code: `Left: input.data.name\nOperator: is equal to\nRight: ditto`,
              },
              {
                id: "steps",
                label: "From another step",
                code: `Left: steps.node_2c0a8.data.name\nOperator: is equal to\nRight: ditto`,
              },
              {
                id: "status",
                label: "HTTP status",
                code: `Left: input.status\nOperator: is equal to\nRight: 200`,
              },
              {
                id: "compare",
                label: "Compare fields",
                code: `Left: {{data.base_experience}}\nOperator: is greater than\nRight: {{data.id}}`,
              },
            ]}
          />
        </>
      ),
    ],
  },
  "/docs/builder/merge": {
    title: "Merge Node",
    breadcrumb: [
      { label: "Docs", href: "/docs" },
      { label: "Workflow Builder", href: "/docs/builder/overview" },
      { label: "Merge" },
    ],
    description: "Combine outputs from multiple steps into a single payload.",
    sections: [
      section(
        "overview",
        "Overview",
        prose(
          <>
            <p>
              Merge collects outputs from steps that have already executed and
              exposes them in a single object. Use it before an If node when you
              want to compare values from several steps.
            </p>
          </>
        )
      ),
      section(
        "output",
        "Output Shape",
        <CodeTabs
          tabs={[
            {
              id: "shape",
              label: "Output",
              code: `{\n  \"status\": 200,\n  \"data\": {\n    \"input\": { ... },\n    \"steps\": {\n      \"node_2c0a8\": { \"status\": 200, \"data\": { ... } }\n    }\n  }\n}`,
            },
          ]}
        />
      ),
      section(
        "example",
        "Example",
        <CodeTabs
          tabs={[
            {
              id: "merge-if",
              label: "Merge + If",
              code: `Merge -> If\nLeft: steps.node_2c0a8.data.name\nOperator: is equal to\nRight: ditto`,
            },
          ]}
        />
      ),
    ],
  },
  "/docs/builder/switch": {
    title: "Switch Node",
    breadcrumb: [
      { label: "Docs", href: "/docs" },
      { label: "Workflow Builder", href: "/docs/builder/overview" },
      { label: "Switch" },
    ],
    description: "Route based on a value (coming soon).",
    sections: [
      section(
        "status",
        "Status",
        prose(
          <>
            <p>
              Switch is available in the palette and can be configured with an
              expression. Multi-branch routing is planned.
            </p>
          </>
        )
      ),
    ],
  },
};
