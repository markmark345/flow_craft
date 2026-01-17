"use client";

import { CodeTabs } from "../../components/code-tabs";
import type { DocsPage } from "../docs-data-types";
import { prose, section } from "../docs-data-helpers";

export const OVERVIEW_PAGES: Record<string, DocsPage> = {
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
  "/docs/builder/app-action": {
    title: "Action in an app",
    breadcrumb: [
      { label: "Docs", href: "/docs" },
      { label: "Workflow Builder", href: "/docs/builder/overview" },
      { label: "Action in an app" },
    ],
    description: "Call external apps like Google Sheets, Gmail, and GitHub from a single node.",
    sections: [
      section(
        "connect",
        "Connect credentials",
        prose(
          <>
            <p>
              Before using app actions, connect accounts in{" "}
              <strong>Settings → Credentials</strong> (personal) or{" "}
              <strong>Project → Credentials</strong> (project).
            </p>
            <p>
              The node will use the selected <code>credentialId</code> to fetch an access token and call the provider API.
            </p>
          </>
        )
      ),
      section(
        "configure",
        "Configure the node",
        prose(
          <>
            <p>
              Add <strong>Action in an app</strong> from the node palette, then choose:
            </p>
            <ul>
              <li>
                <strong>App</strong> (Google Sheets / Gmail / GitHub)
              </li>
              <li>
                <strong>Action</strong> (searchable list)
              </li>
              <li>
                <strong>Credential</strong> to run the action with
              </li>
            </ul>
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
                id: "sheets",
                label: "Google Sheets (Append row)",
                code: `App: Google Sheets\nAction: Append row in sheet\nSpreadsheet ID: 1AbcD...XYZ\nSheet name: Sheet1\nRow values: [\"value1\",\"value2\"]`,
              },
              {
                id: "gmail",
                label: "Gmail (Send email)",
                code: `App: Gmail\nAction: Send email\nTo: recipient@example.com\nSubject: Hello\nBody (text): Hi from FlowCraft`,
              },
              {
                id: "github",
                label: "GitHub (Create issue)",
                code: `App: GitHub\nAction: Create an issue\nOwner: octocat\nRepository: hello-world\nTitle: Bug report\nBody: Details...`,
              },
            ]}
          />
        </>
      ),
    ],
  },
};
