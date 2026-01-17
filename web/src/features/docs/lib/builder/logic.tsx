"use client";

import { CodeTabs } from "../../components/code-tabs";
import type { DocsPage } from "../docs-data-types";
import { prose, section } from "../docs-data-helpers";

export const LOGIC_PAGES: Record<string, DocsPage> = {
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
