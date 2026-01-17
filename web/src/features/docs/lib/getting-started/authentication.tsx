"use client";

import { API_BASE_URL } from "@/lib/env";
import { CodeTabs } from "../../components/code-tabs";
import type { DocsPage } from "../docs-data-types";
import { prose, section } from "../docs-data-helpers";

export const authenticationPage: DocsPage = {
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
            Authentication to the FlowCraft API uses API keys. Use HTTP Basic Auth: API key as username
            and an empty password.
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
              id: "curl",
              label: "cURL",
              code: `curl ${API_BASE_URL}/flows -u YOUR_API_KEY:`,
            },
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
};
