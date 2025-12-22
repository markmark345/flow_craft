"use client";

import Link from "next/link";
import type { Route } from "next";
import type { DocsPage } from "./docs-data-types";
import { EndpointList, prose, section } from "./docs-data-helpers";

export const RESOURCES_PAGES: Record<string, DocsPage> = {
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
              A workflow definition stores the React Flow graph
              (nodes/edges/viewport) and optional sticky notes. Edges currently
              define execution ordering.
            </p>
            <p>
              To learn the UI, see{" "}
              <Link
                href={"/docs/builder/overview" as Route}
                className="text-accent hover:underline"
              >
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
      section(
        "endpoints",
        "Endpoints",
        <EndpointList
          endpoints={[
            "GET /runs",
            "GET /runs/:id",
            "GET /runs/:id/steps",
            "GET /runs/:id/steps/:stepId",
            "POST /runs/:id/cancel",
          ]}
        />
      ),
      section(
        "run-steps",
        "Run steps",
        prose(
          <>
            <p>
              Each node execution creates a run step (STEP_01, STEP_02, ...). In
              the builder, you can inspect inputs and outputs for the last run
              from the right sidebar.
            </p>
            <p>
              Tip: selecting an edge shows the <em>source outputs</em> and{" "}
              <em>target inputs/outputs</em> for quick debugging.
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
              The <strong>Schedule</strong> node runs your flow automatically
              using a cron expression. It is executed by the FlowCraft worker
              process.
            </p>
            <p>
              See{" "}
              <Link
                href={"/docs/builder/schedule" as Route}
                className="text-accent hover:underline"
              >
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
              Webhook and HTTP Trigger nodes are represented in the builder, but
              inbound trigger activation is still under development. For now,
              they behave like trigger steps when you manually run a flow.
            </p>
          </>
        )
      ),
    ],
  },
};
