"use client";

import Link from "next/link";
import { API_BASE_URL } from "@/lib/env";
import { CodeTabs } from "../../components/code-tabs";
import type { DocsPage } from "../docs-data-types";
import { CopyIconButton, DocCard, SdkCard, prose, section } from "../docs-data-helpers";

export const introductionPage: DocsPage = {
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
              FlowCraft uses API keys to authenticate requests. Authentication is performed via HTTP Basic
              Auth: pass your API key as the username. Password can be empty.
            </p>
            <p>
              Manage keys in{" "}
              <Link href="/settings" className="text-accent hover:underline">
                Settings
              </Link>
              .
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
            <p>
              FlowCraft provides official open-source libraries to help you integrate our API into your
              codebase.
            </p>
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
};
