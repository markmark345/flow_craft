"use client";

import { ReactNode } from "react";
import { API_BASE_URL } from "@/shared/lib/env";
import { CodeTabs } from "../components/code-tabs";
import Link from "next/link";
import type { Route } from "next";
import { Icon } from "@/shared/components/icon";
import { useAppStore } from "@/shared/hooks/use-app-store";

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

export const DOCS_NAV: DocsNavGroup[] = [
  {
    label: "Getting Started",
    items: [
      { label: "Introduction", href: "/docs/introduction", icon: "dashboard" },
      { label: "Authentication", href: "/docs/authentication", icon: "person" },
      { label: "Errors & Rate Limits", href: "/docs/errors-rate-limits", icon: "warning" },
    ],
  },
  {
    label: "Resources",
    items: [
      { label: "Workflows", href: "/docs/resources/workflows", icon: "account_tree" },
      { label: "Executions", href: "/docs/resources/executions", icon: "play_circle" },
      { label: "Triggers", href: "/docs/resources/triggers", icon: "bolt" },
    ],
  },
  {
    label: "Workflow Builder",
    items: [
      { label: "Overview", href: "/docs/builder/overview", icon: "grid_view" },
      { label: "HTTP Request", href: "/docs/builder/http-request", icon: "arrow_forward" },
      { label: "Schedule", href: "/docs/builder/schedule", icon: "schedule" },
      { label: "Webhook", href: "/docs/builder/webhook", icon: "data_object" },
      { label: "HTTP Trigger", href: "/docs/builder/http-trigger", icon: "bolt" },
      { label: "Slack", href: "/docs/builder/slack", icon: "terminal" },
      { label: "Run JS", href: "/docs/builder/run-js", icon: "terminal" },
      { label: "Database", href: "/docs/builder/database", icon: "data_object" },
      { label: "Delay", href: "/docs/builder/delay", icon: "schedule" },
      { label: "Filter", href: "/docs/builder/filter", icon: "filter_list" },
      { label: "Switch", href: "/docs/builder/switch", icon: "view_list" },
    ],
  },
  {
    label: "Developers",
    items: [
      { label: "Webhooks", href: "/docs/developers/webhooks", icon: "data_object" },
      { label: "SDKs & Libraries", href: "/docs/developers/sdks", icon: "terminal" },
    ],
  },
];

export const DOCS_FOOTER_LINKS = [
  { label: "Support Center", href: "/docs/support", icon: "help" },
  { label: "Changelog", href: "/docs/changelog", icon: "history" },
];

export const DOCS_ORDER: string[] = DOCS_NAV.flatMap((g) => g.items.map((i) => i.href));

export function getDocsPage(href: string): DocsPage | undefined {
  return PAGES[href];
}

function section(id: string, title: string, content: ReactNode, badge?: string): DocsSection {
  return { id, title, content, badge };
}

function prose(children: ReactNode) {
  return <div className="text-sm text-muted leading-relaxed space-y-3">{children}</div>;
}

const PAGES: Record<string, DocsPage> = {
  "/docs/introduction": {
    title: "FlowCraft API Documentation",
    breadcrumb: [{ label: "Docs", href: "/docs" }, { label: "Introduction" }],
    description:
      "Automate your infrastructure programmatically. The FlowCraft API allows you to build, manage, and execute visual workflows directly from your application.",
    sections: [
      section(
        "authentication",
        "Authentication",
        <>
          {prose(
            <>
              <p>
                FlowCraft uses API keys to authenticate requests. Authentication is performed via HTTP Basic Auth: pass
                your API key as the username. Password can be empty.
              </p>
              <p>
                Manage keys in <Link href="/settings" className="text-accent hover:underline">Settings</Link>.
              </p>
            </>
          )}
          <div className="mt-6">
            <CodeTabs
              tabs={[
                {
                  id: "curl",
                  label: "cURL",
                  code: `curl ${API_BASE_URL}/flows \\\n  -u YOUR_API_KEY:`,
                },
                {
                  id: "node",
                  label: "Node.js",
                  code: `import fetch from "node-fetch";\n\nconst res = await fetch("${API_BASE_URL}/flows", {\n  headers: {\n    Authorization: \"Basic \" + Buffer.from(\"YOUR_API_KEY:\").toString(\"base64\"),\n  },\n});\n\nconsole.log(await res.json());`,
                },
                {
                  id: "python",
                  label: "Python",
                  code: `import requests\n\nres = requests.get("${API_BASE_URL}/flows", auth=("YOUR_API_KEY", ""))\nprint(res.json())`,
                },
              ]}
            />
          </div>
        </>,
        "Required"
      ),
      section(
        "base-url",
        "Base URL",
        <>
          {prose(
            <>
              <p>All URLs referenced in the documentation share this base URL:</p>
            </>
          )}
          <div className="inline-flex items-center gap-2 bg-surface2 px-4 py-2 rounded-lg border border-border font-mono text-sm text-text mt-3">
            <span className="break-all">{API_BASE_URL}</span>
            <CopyIconButton value={API_BASE_URL} />
          </div>
        </>
      ),
      section(
        "core-resources",
        "Core Resources",
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DocCard
              href="/docs/resources/workflows"
              title="Workflows"
              description="Create, list, update and delete workflow definitions."
              icon="account_tree"
              tone="accent"
            />
            <DocCard
              href="/docs/resources/executions"
              title="Executions"
              description="Trigger workflow runs and retrieve execution history and logs."
              icon="play_circle"
              tone="warning"
            />
            <DocCard
              href="/docs/resources/triggers"
              title="Triggers"
              description="Configure webhook and schedule-based triggers for your automation."
              icon="bolt"
              tone="success"
            />
            <DocCard
              href="/docs/developers/sdks"
              title="SDKs & Integrations"
              description="Official SDKs and integration helpers (some items coming soon)."
              icon="terminal"
              tone="neutral"
            />
          </div>
        </>
      ),
      section(
        "official-sdks",
        "Official SDKs",
        <>
          {prose(
            <>
              <p>FlowCraft provides official open-source libraries to help you integrate our API into your codebase.</p>
            </>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <SdkCard title="Node.js" hint="npm install flowcraft" icon="terminal" tone="success" />
            <SdkCard title="Python" hint="pip install flowcraft" icon="terminal" tone="warning" />
            <SdkCard title="Go" hint="go get flowcraft" icon="terminal" tone="accent" />
          </div>
        </>
      ),
    ],
  },
  "/docs/authentication": {
    title: "Authentication",
    breadcrumb: [{ label: "Docs", href: "/docs" }, { label: "Authentication" }],
    description: "How to authenticate to the FlowCraft API.",
    sections: [
      section(
        "api-keys",
        "API keys",
        prose(
          <>
            <p>
              Authentication to the FlowCraft API uses API keys. Use HTTP Basic Auth: API key as username and an empty
              password.
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
              { id: "curl", label: "cURL", code: `curl ${API_BASE_URL}/flows -u YOUR_API_KEY:` },
              {
                id: "js",
                label: "Node.js",
                code: `const res = await fetch("${API_BASE_URL}/runs");\nconsole.log(await res.json());`,
              },
              {
                id: "py",
                label: "Python",
                code: `import requests\n\nprint(requests.get("${API_BASE_URL}/runs").json())`,
              },
            ]}
          />
        </>
      ),
    ],
  },
  "/docs/errors-rate-limits": {
    title: "Errors & Rate Limits",
    breadcrumb: [{ label: "Docs", href: "/docs" }, { label: "Errors & Rate Limits" }],
    description: "Error responses and recommended retry strategy.",
    sections: [
      section(
        "errors",
        "Errors",
        prose(
          <>
            <p>
              API responses follow a common envelope. When an error occurs, the response contains an <code>error</code>{" "}
              object with <code>code</code> and <code>message</code>.
            </p>
          </>
        )
      ),
      section(
        "rate-limits",
        "Rate limits",
        prose(
          <>
            <p>
              Rate limiting is not enforced in the local dev API. For production, plan for standard retry/backoff for
              429 and 5xx responses.
            </p>
          </>
        )
      ),
    ],
  },
  "/docs/resources/workflows": {
    title: "Workflows",
    breadcrumb: [
      { label: "Docs", href: "/docs" },
      { label: "Resources", href: "/docs/introduction#core-resources" },
      { label: "Workflows" },
    ],
    description: "Manage workflow definitions (flows).",
    sections: [
      section(
        "endpoints",
        "Endpoints",
        <EndpointList
          endpoints={[
            "GET /flows",
            "GET /flows/:id",
            "POST /flows",
            "PUT /flows/:id",
            "DELETE /flows/:id",
            "POST /flows/:id/run",
          ]}
        />
      ),
      section(
        "builder",
        "Builder concepts",
        prose(
          <>
            <p>
              A workflow definition stores the React Flow graph (nodes/edges/viewport) and optional sticky notes. Edges
              currently define execution ordering.
            </p>
            <p>
              To learn the UI, see{" "}
              <Link href={"/docs/builder/overview" as Route} className="text-accent hover:underline">
                Workflow Builder overview
              </Link>
              .
            </p>
          </>
        )
      ),
    ],
  },
  "/docs/resources/executions": {
    title: "Executions",
    breadcrumb: [
      { label: "Docs", href: "/docs" },
      { label: "Resources", href: "/docs/introduction#core-resources" },
      { label: "Executions" },
    ],
    description: "Runs and run steps.",
    sections: [
      section("endpoints", "Endpoints", <EndpointList endpoints={["GET /runs", "GET /runs/:id", "GET /runs/:id/steps", "GET /runs/:id/steps/:stepId", "POST /runs/:id/cancel"]} />),
      section(
        "run-steps",
        "Run steps",
        prose(
          <>
            <p>
              Each node execution creates a run step (STEP_01, STEP_02, ...). In the builder, you can inspect inputs and
              outputs for the last run from the right sidebar.
            </p>
            <p>
              Tip: selecting an edge shows the <em>source outputs</em> and <em>target inputs/outputs</em> for quick
              debugging.
            </p>
          </>
        )
      ),
    ],
  },
  "/docs/resources/triggers": {
    title: "Triggers",
    breadcrumb: [
      { label: "Docs", href: "/docs" },
      { label: "Resources", href: "/docs/introduction#core-resources" },
      { label: "Triggers" },
    ],
    description: "Trigger nodes and how they affect execution.",
    sections: [
      section(
        "schedule",
        "Schedule",
        prose(
          <>
            <p>
              The <strong>Schedule</strong> node runs your flow automatically using a cron expression. It is executed by
              the FlowCraft worker process.
            </p>
            <p>
              See{" "}
              <Link href={"/docs/builder/schedule" as Route} className="text-accent hover:underline">
                Schedule node guide
              </Link>{" "}
              for setup and troubleshooting.
            </p>
          </>
        )
      ),
      section(
        "webhook",
        "Webhook + HTTP Trigger",
        prose(
          <>
            <p>
              Webhook and HTTP Trigger nodes are represented in the builder, but inbound trigger activation is still
              under development. For now, they behave like trigger steps when you manually run a flow.
            </p>
          </>
        )
      ),
    ],
  },
  "/docs/builder/overview": {
    title: "Workflow Builder Overview",
    breadcrumb: [{ label: "Docs", href: "/docs" }, { label: "Workflow Builder", href: "/docs/builder/overview" }, { label: "Overview" }],
    description: "Build, run, and debug workflows using the visual builder.",
    sections: [
      section(
        "create",
        "Create a flow",
        prose(
          <>
            <p>
              Create nodes by dragging from the palette. Connect nodes by dragging from the right handle to the next
              node’s left handle.
            </p>
            <p>
              Use <strong>Save</strong> to persist changes. Some actions (like Schedule) require the flow to be saved to
              become active.
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
              Click <strong>Run</strong> to execute the flow. Running nodes/edges are highlighted; completed nodes show a
              status badge.
            </p>
            <p>
              In the Inspector: open <strong>Input / Output</strong> to see step inputs and outputs. Selecting an edge
              shows I/O on both sides of the connection.
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
              Edges determine the order of execution. You can delete an edge by selecting it and pressing{" "}
              <code>Delete</code>/<code>Backspace</code>, or double-click it.
            </p>
          </>
        )
      ),
    ],
  },
  "/docs/builder/http-request": {
    title: "HTTP Request Node",
    breadcrumb: [{ label: "Docs", href: "/docs" }, { label: "Workflow Builder", href: "/docs/builder/overview" }, { label: "HTTP Request" }],
    description: "Call external APIs with method, headers, query parameters, and optional body.",
    sections: [
      section(
        "setup",
        "Setup",
        prose(
          <>
            <p>
              Set the <strong>URL</strong> and choose a method (GET/POST/PUT/DELETE). Add <strong>Query Parameters</strong>{" "}
              and <strong>Headers</strong> using the key/value editor.
            </p>
            <p>
              For POST/PUT, you can provide a JSON body. If the body looks like JSON, Content-Type is set to{" "}
              <code>application/json</code> automatically.
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
              Use the Run detail page or the builder’s <strong>Input / Output</strong> tab to inspect the actual URL used
              (including query params) and the JSON output.
            </p>
          </>
        )
      ),
    ],
  },
  "/docs/builder/schedule": {
    title: "Schedule Node",
    breadcrumb: [{ label: "Docs", href: "/docs" }, { label: "Workflow Builder", href: "/docs/builder/overview" }, { label: "Schedule" }],
    description: "Run flows automatically using a schedule.",
    sections: [
      section(
        "picker",
        "Pick a schedule",
        prose(
          <>
            <p>
              Use the schedule picker (Every N minutes / Hourly / Daily / Weekly / Monthly). The UI generates a cron
              expression behind the scenes.
            </p>
            <p>
              For every minute: set <strong>Every N minutes</strong> to <code>1</code> (preview becomes{" "}
              <code>* * * * *</code>).
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
              Schedules are executed by the <strong>worker</strong>. After configuring, click <strong>Save</strong> so the
              flow definition is stored in the API database.
            </p>
            <p>
              Keep the worker running (docker compose / `go run ./cmd/worker`). The worker refreshes schedules about every{" "}
              <strong>15 seconds</strong>, and the first run starts on the next minute boundary.
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
              Scheduling uses the worker machine’s local time zone. In Docker, that is usually UTC unless you configure
              it differently.
            </p>
          </>
        )
      ),
    ],
  },
  "/docs/builder/webhook": {
    title: "Webhook Node",
    breadcrumb: [{ label: "Docs", href: "/docs" }, { label: "Workflow Builder", href: "/docs/builder/overview" }, { label: "Webhook" }],
    description: "Configure incoming webhooks (inbound trigger execution is coming soon).",
    sections: [
      section(
        "config",
        "Configuration",
        prose(
          <>
            <p>
              Set the webhook path and optional secret. Inbound webhook triggering is under development; for now the node
              produces a sample payload when the flow is run manually.
            </p>
          </>
        )
      ),
    ],
  },
  "/docs/builder/http-trigger": {
    title: "HTTP Trigger Node",
    breadcrumb: [{ label: "Docs", href: "/docs" }, { label: "Workflow Builder", href: "/docs/builder/overview" }, { label: "HTTP Trigger" }],
    description: "Start flows from HTTP requests (coming soon).",
    sections: [
      section(
        "status",
        "Status",
        prose(
          <>
            <p>
              The HTTP Trigger node is available in the builder and can be configured with a path and method. Inbound
              activation is coming soon; currently it behaves like a trigger step when you manually run a flow.
            </p>
          </>
        )
      ),
    ],
  },
  "/docs/builder/slack": {
    title: "Slack Node",
    breadcrumb: [{ label: "Docs", href: "/docs" }, { label: "Workflow Builder", href: "/docs/builder/overview" }, { label: "Slack" }],
    description: "Send notifications to Slack (UI demo; delivery is simulated).",
    sections: [
      section(
        "setup",
        "Setup",
        prose(
          <>
            <p>
              Select action type and a connection, then set channel and message. The Slack node validates required fields
              and shows “Configured” when ready.
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
              Slack delivery is currently simulated during execution. Connector management is planned for a future
              milestone.
            </p>
          </>
        )
      ),
    ],
  },
  "/docs/builder/run-js": {
    title: "Run JS Node",
    breadcrumb: [{ label: "Docs", href: "/docs" }, { label: "Workflow Builder", href: "/docs/builder/overview" }, { label: "Run JS" }],
    description: "Run custom JavaScript (simulated execution).",
    sections: [
      section(
        "script",
        "Script",
        prose(
          <>
            <p>
              Write your script in the node configuration. Execution is simulated for now; a full JS runtime and data
              passing are planned.
            </p>
          </>
        )
      ),
    ],
  },
  "/docs/builder/database": {
    title: "Database Node",
    breadcrumb: [{ label: "Docs", href: "/docs" }, { label: "Workflow Builder", href: "/docs/builder/overview" }, { label: "Database" }],
    description: "Run a database query (simulated execution).",
    sections: [
      section(
        "query",
        "Query",
        prose(
          <>
            <p>
              Provide a SQL query. Execution is simulated for now; connection configuration and real querying are planned.
            </p>
          </>
        )
      ),
    ],
  },
  "/docs/builder/delay": {
    title: "Delay Node",
    breadcrumb: [{ label: "Docs", href: "/docs" }, { label: "Workflow Builder", href: "/docs/builder/overview" }, { label: "Delay" }],
    description: "Wait before continuing (simulated).",
    sections: [
      section(
        "config",
        "Configuration",
        prose(
          <>
            <p>
              Set the delay duration in seconds. Execution is simulated to keep runs responsive in local development.
            </p>
          </>
        )
      ),
    ],
  },
  "/docs/builder/filter": {
    title: "Filter (If) Node",
    breadcrumb: [{ label: "Docs", href: "/docs" }, { label: "Workflow Builder", href: "/docs/builder/overview" }, { label: "Filter" }],
    description: "Branch your workflow based on a condition.",
    sections: [
      section(
        "branches",
        "Branches",
        prose(
          <>
            <p>
              The Filter node has <code>true</code> and <code>false</code> outputs. Use it to split the flow into
              different paths.
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
              Enter a condition string (for example: <code>order.total &gt; 500</code>). Condition evaluation is planned
              for a future milestone; currently it is treated as a configurable label.
            </p>
          </>
        )
      ),
    ],
  },
  "/docs/builder/switch": {
    title: "Switch Node",
    breadcrumb: [{ label: "Docs", href: "/docs" }, { label: "Workflow Builder", href: "/docs/builder/overview" }, { label: "Switch" }],
    description: "Route based on a value (coming soon).",
    sections: [
      section(
        "status",
        "Status",
        prose(
          <>
            <p>
              Switch is available in the palette and can be configured with an expression. Multi-branch routing is
              planned.
            </p>
          </>
        )
      ),
    ],
  },
  "/docs/developers/webhooks": {
    title: "Webhooks (Developer Guide)",
    breadcrumb: [{ label: "Docs", href: "/docs" }, { label: "Developers", href: "/docs/developers/webhooks" }, { label: "Webhooks" }],
    description: "Integrate external systems with your workflows (coming soon).",
    sections: [
      section(
        "overview",
        "Overview",
        prose(
          <>
            <p>
              Incoming webhooks will allow you to trigger runs from external systems. The UI and node configuration exist
              today, and the server-side trigger execution is under development.
            </p>
          </>
        )
      ),
    ],
  },
  "/docs/developers/sdks": {
    title: "SDKs & Libraries",
    breadcrumb: [{ label: "Docs", href: "/docs" }, { label: "Developers", href: "/docs/developers/sdks" }, { label: "SDKs & Libraries" }],
    description: "Client libraries and examples (placeholders).",
    sections: [
      section(
        "node",
        "Node.js",
        <CodeTabs tabs={[{ id: "npm", label: "Install", code: "npm install flowcraft" }]} />
      ),
      section(
        "python",
        "Python",
        <CodeTabs tabs={[{ id: "pip", label: "Install", code: "pip install flowcraft" }]} />
      ),
      section(
        "go",
        "Go",
        <CodeTabs tabs={[{ id: "go", label: "Install", code: "go get flowcraft" }]} />
      ),
    ],
  },
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
            <p>For now, support is handled in-project. Create an issue in your repository or contact the maintainers.</p>
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

function EndpointList({ endpoints }: { endpoints: string[] }) {
  return (
    <div className="bg-surface2 rounded-xl border border-border overflow-hidden">
      <div className="px-4 py-3 border-b border-border text-xs font-bold uppercase tracking-wider text-muted">Endpoints</div>
      <ul className="p-4 space-y-1 font-mono text-xs text-text">
        {endpoints.map((e) => (
          <li key={e}>{e}</li>
        ))}
      </ul>
    </div>
  );
}

function DocCard({
  href,
  title,
  description,
  icon,
  tone,
}: {
  href: string;
  title: string;
  description: string;
  icon: string;
  tone: "accent" | "success" | "warning" | "neutral";
}) {
  const toneVar: Record<typeof tone, string> = {
    accent: "var(--accent)",
    success: "var(--success)",
    warning: "var(--warning)",
    neutral: "var(--muted)",
  };
  const c = toneVar[tone] || "var(--accent)";
  return (
    <Link
      href={href as Route}
      className="group block p-6 bg-surface2 rounded-xl border border-border hover:border-[color-mix(in_srgb,var(--accent)_50%,transparent)] transition-all"
    >
      <div className="flex items-center justify-between mb-4">
        <div
          className="p-2 rounded-lg border"
          style={{
            background: `color-mix(in srgb, ${c} 12%, transparent)`,
            borderColor: `color-mix(in srgb, ${c} 20%, transparent)`,
            color: c,
          }}
        >
          <Icon name={icon} className="text-[18px]" />
        </div>
        <span className="text-muted group-hover:translate-x-1 transition-transform">
          <Icon name="arrow_forward" className="text-[18px]" />
        </span>
      </div>
      <div className="text-lg font-bold text-text mb-1 flex items-center gap-2">{title}</div>
      <div className="text-sm text-muted">{description}</div>
    </Link>
  );
}

function SdkCard({
  title,
  hint,
  icon,
  tone,
}: {
  title: string;
  hint: string;
  icon: string;
  tone: "accent" | "success" | "warning";
}) {
  const toneVar: Record<typeof tone, string> = {
    accent: "var(--accent)",
    success: "var(--success)",
    warning: "var(--warning)",
  };
  const c = toneVar[tone] || "var(--accent)";
  return (
    <div className="flex items-center gap-4 p-4 rounded-lg bg-surface2 border border-border">
      <div
        className="size-10 rounded flex items-center justify-center shrink-0 border"
        style={{
          background: `color-mix(in srgb, ${c} 12%, transparent)`,
          borderColor: `color-mix(in srgb, ${c} 20%, transparent)`,
          color: c,
        }}
      >
        <Icon name={icon} className="text-[18px]" />
      </div>
      <div>
        <h4 className="font-bold text-text">{title}</h4>
        <div className="text-xs text-accent font-mono">{hint}</div>
      </div>
    </div>
  );
}

function CopyIconButton({ value }: { value: string }) {
  const showSuccess = useAppStore((s) => s.showSuccess);
  const showError = useAppStore((s) => s.showError);
  return (
    <button
      type="button"
      className="inline-flex items-center justify-center size-7 rounded-md text-muted hover:text-accent hover:bg-surface transition-colors"
      title="Copy"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          showSuccess("Copied");
        } catch (err: any) {
          showError("Copy failed", err?.message || "Unable to copy");
        }
      }}
    >
      <Icon name="content_copy" className="text-[16px]" />
    </button>
  );
}
