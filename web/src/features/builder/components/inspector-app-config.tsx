"use client";

import { useMemo } from "react";
import { Select, SelectOption } from "@/shared/components/select";
import { FieldRow } from "./inspector-field-row";
import { NodeField } from "../types/node-catalog";

type AppKey = "gmail" | "googleSheets" | "github";

type ActionDef = {
  key: string;
  label: string;
  description?: string;
  fields: NodeField[];
};

const APP_OPTIONS: SelectOption[] = [
  {
    value: "googleSheets",
    label: "Google Sheets",
    description: "Create, read, update, and delete Sheets data",
  },
  {
    value: "gmail",
    label: "Gmail",
    description: "Send email using Gmail API",
  },
  {
    value: "github",
    label: "GitHub",
    description: "Work with repositories, files, and issues",
  },
];

const BASE_FIELDS: Record<AppKey, NodeField[]> = {
  googleSheets: [
    {
      key: "credentialId",
      label: "Credential",
      type: "credential",
      provider: "google",
      required: true,
      helpText: "Connect a Google account in Credentials to use Sheets.",
    },
  ],
  gmail: [
    {
      key: "credentialId",
      label: "Credential",
      type: "credential",
      provider: "google",
      required: true,
      helpText: "Connect a Google account in Credentials to send email.",
    },
  ],
  github: [
    {
      key: "credentialId",
      label: "Credential",
      type: "credential",
      provider: "github",
      required: true,
      helpText: "Connect a GitHub account in Credentials to call the GitHub API.",
    },
  ],
};

const ACTIONS: Record<AppKey, ActionDef[]> = {
  gmail: [
    {
      key: "gmail.sendEmail",
      label: "Send email",
      fields: [
        { key: "from", label: "From (optional)", type: "text", placeholder: "me@company.com" },
        { key: "to", label: "To", type: "text", placeholder: "recipient@company.com", required: true },
        { key: "subject", label: "Subject", type: "text", placeholder: "Hello from FlowCraft", required: true },
        { key: "bodyText", label: "Body (text)", type: "textarea", placeholder: "Write a plain-text message..." },
        { key: "bodyHtml", label: "Body (HTML)", type: "textarea", placeholder: "<p>Write HTML content...</p>" },
      ],
    },
  ],
  googleSheets: [
    {
      key: "gsheets.createSpreadsheet",
      label: "Create spreadsheet",
      fields: [
        { key: "title", label: "Title", type: "text", placeholder: "My spreadsheet", required: true },
        { key: "sheetName", label: "First sheet name (optional)", type: "text", placeholder: "Sheet1" },
      ],
    },
    {
      key: "gsheets.deleteSpreadsheet",
      label: "Delete spreadsheet",
      fields: [{ key: "spreadsheetId", label: "Spreadsheet ID", type: "text", placeholder: "1AbcD...XYZ", required: true }],
    },
    {
      key: "gsheets.appendRow",
      label: "Append row in sheet",
      fields: [
        { key: "spreadsheetId", label: "Spreadsheet ID", type: "text", placeholder: "1AbcD...XYZ", required: true },
        { key: "sheetName", label: "Sheet name", type: "text", placeholder: "Sheet1" },
        {
          key: "values",
          label: "Row values",
          type: "textarea",
          placeholder: "[\"value1\", \"value2\"] or value1, value2",
          required: true,
        },
      ],
    },
    {
      key: "gsheets.updateRow",
      label: "Update row in sheet",
      fields: [
        { key: "spreadsheetId", label: "Spreadsheet ID", type: "text", placeholder: "1AbcD...XYZ", required: true },
        { key: "range", label: "Range", type: "text", placeholder: "Sheet1!A2:Z2", required: true },
        {
          key: "values",
          label: "Row values",
          type: "textarea",
          placeholder: "[\"value1\", \"value2\"] or value1, value2",
          required: true,
        },
      ],
    },
    {
      key: "gsheets.getRows",
      label: "Get row(s) in sheet",
      fields: [
        { key: "spreadsheetId", label: "Spreadsheet ID", type: "text", placeholder: "1AbcD...XYZ", required: true },
        { key: "range", label: "Range", type: "text", placeholder: "Sheet1!A1:Z100", required: true },
      ],
    },
    {
      key: "gsheets.clearRange",
      label: "Clear sheet/range",
      fields: [
        { key: "spreadsheetId", label: "Spreadsheet ID", type: "text", placeholder: "1AbcD...XYZ", required: true },
        { key: "range", label: "Range", type: "text", placeholder: "Sheet1!A:Z", required: true },
      ],
    },
    {
      key: "gsheets.createSheet",
      label: "Create sheet",
      fields: [
        { key: "spreadsheetId", label: "Spreadsheet ID", type: "text", placeholder: "1AbcD...XYZ", required: true },
        { key: "sheetName", label: "Sheet name", type: "text", placeholder: "New sheet", required: true },
      ],
    },
    {
      key: "gsheets.deleteSheet",
      label: "Delete sheet",
      fields: [
        { key: "spreadsheetId", label: "Spreadsheet ID", type: "text", placeholder: "1AbcD...XYZ", required: true },
        { key: "sheetName", label: "Sheet name", type: "text", placeholder: "Sheet1", required: true },
      ],
    },
    {
      key: "gsheets.deleteRowsOrColumns",
      label: "Delete rows or columns from sheet",
      fields: [
        { key: "spreadsheetId", label: "Spreadsheet ID", type: "text", placeholder: "1AbcD...XYZ", required: true },
        { key: "sheetName", label: "Sheet name", type: "text", placeholder: "Sheet1", required: true },
        { key: "dimension", label: "Dimension", type: "select", options: ["ROWS", "COLUMNS"], required: true },
        { key: "startIndex", label: "Start index (0-based)", type: "number", placeholder: "0", required: true },
        { key: "endIndex", label: "End index (exclusive)", type: "number", placeholder: "1", required: true },
      ],
    },
  ],
  github: [
    {
      key: "github.createFile",
      label: "File: Create a file",
      fields: [
        { key: "owner", label: "Owner", type: "text", placeholder: "octocat", required: true },
        { key: "repo", label: "Repository", type: "text", placeholder: "hello-world", required: true },
        { key: "path", label: "Path", type: "text", placeholder: "README.md", required: true },
        { key: "message", label: "Commit message", type: "text", placeholder: "Add file", required: true },
        { key: "content", label: "Content", type: "textarea", placeholder: "File contents...", required: true },
        { key: "branch", label: "Branch (optional)", type: "text", placeholder: "main" },
      ],
    },
    {
      key: "github.editFile",
      label: "File: Edit a file",
      fields: [
        { key: "owner", label: "Owner", type: "text", placeholder: "octocat", required: true },
        { key: "repo", label: "Repository", type: "text", placeholder: "hello-world", required: true },
        { key: "path", label: "Path", type: "text", placeholder: "README.md", required: true },
        { key: "message", label: "Commit message", type: "text", placeholder: "Update file", required: true },
        { key: "content", label: "Content", type: "textarea", placeholder: "New file contents...", required: true },
        { key: "sha", label: "SHA (optional)", type: "text", placeholder: "auto-resolve if blank" },
        { key: "branch", label: "Branch (optional)", type: "text", placeholder: "main" },
      ],
    },
    {
      key: "github.deleteFile",
      label: "File: Delete a file",
      fields: [
        { key: "owner", label: "Owner", type: "text", placeholder: "octocat", required: true },
        { key: "repo", label: "Repository", type: "text", placeholder: "hello-world", required: true },
        { key: "path", label: "Path", type: "text", placeholder: "README.md", required: true },
        { key: "message", label: "Commit message", type: "text", placeholder: "Delete file", required: true },
        { key: "sha", label: "SHA (optional)", type: "text", placeholder: "auto-resolve if blank" },
        { key: "branch", label: "Branch (optional)", type: "text", placeholder: "main" },
      ],
    },
    {
      key: "github.getFile",
      label: "File: Get a file",
      fields: [
        { key: "owner", label: "Owner", type: "text", placeholder: "octocat", required: true },
        { key: "repo", label: "Repository", type: "text", placeholder: "hello-world", required: true },
        { key: "path", label: "Path", type: "text", placeholder: "README.md", required: true },
        { key: "ref", label: "Ref (optional)", type: "text", placeholder: "main" },
      ],
    },
    {
      key: "github.listFiles",
      label: "File: List files",
      fields: [
        { key: "owner", label: "Owner", type: "text", placeholder: "octocat", required: true },
        { key: "repo", label: "Repository", type: "text", placeholder: "hello-world", required: true },
        { key: "path", label: "Path (dir)", type: "text", placeholder: "", required: true },
        { key: "ref", label: "Ref (optional)", type: "text", placeholder: "main" },
      ],
    },
    {
      key: "github.createIssue",
      label: "Issue: Create an issue",
      fields: [
        { key: "owner", label: "Owner", type: "text", placeholder: "octocat", required: true },
        { key: "repo", label: "Repository", type: "text", placeholder: "hello-world", required: true },
        { key: "title", label: "Title", type: "text", placeholder: "Bug report", required: true },
        { key: "body", label: "Body", type: "textarea", placeholder: "Issue details..." },
      ],
    },
    {
      key: "github.createIssueComment",
      label: "Issue: Create a comment on an issue",
      fields: [
        { key: "owner", label: "Owner", type: "text", placeholder: "octocat", required: true },
        { key: "repo", label: "Repository", type: "text", placeholder: "hello-world", required: true },
        { key: "issueNumber", label: "Issue number", type: "number", placeholder: "1", required: true },
        { key: "body", label: "Comment body", type: "textarea", placeholder: "Comment...", required: true },
      ],
    },
    {
      key: "github.editIssue",
      label: "Issue: Edit an issue",
      fields: [
        { key: "owner", label: "Owner", type: "text", placeholder: "octocat", required: true },
        { key: "repo", label: "Repository", type: "text", placeholder: "hello-world", required: true },
        { key: "issueNumber", label: "Issue number", type: "number", placeholder: "1", required: true },
        { key: "title", label: "Title (optional)", type: "text", placeholder: "New title" },
        { key: "body", label: "Body (optional)", type: "textarea", placeholder: "New body..." },
        { key: "state", label: "State (optional)", type: "select", options: ["", "open", "closed"] },
      ],
    },
    {
      key: "github.getIssue",
      label: "Issue: Get an issue",
      fields: [
        { key: "owner", label: "Owner", type: "text", placeholder: "octocat", required: true },
        { key: "repo", label: "Repository", type: "text", placeholder: "hello-world", required: true },
        { key: "issueNumber", label: "Issue number", type: "number", placeholder: "1", required: true },
      ],
    },
    {
      key: "github.lockIssue",
      label: "Issue: Lock an issue",
      fields: [
        { key: "owner", label: "Owner", type: "text", placeholder: "octocat", required: true },
        { key: "repo", label: "Repository", type: "text", placeholder: "hello-world", required: true },
        { key: "issueNumber", label: "Issue number", type: "number", placeholder: "1", required: true },
        {
          key: "lockReason",
          label: "Lock reason (optional)",
          type: "select",
          options: ["", "off-topic", "too heated", "resolved", "spam"],
        },
      ],
    },
    {
      key: "github.listOrgRepos",
      label: "Organization: Get repositories for an organization",
      fields: [{ key: "org", label: "Organization", type: "text", placeholder: "my-org", required: true }],
    },
  ],
};

export function InspectorAppConfig({
  config,
  onPatch,
}: {
  config: Record<string, unknown>;
  onPatch: (patch: Record<string, unknown>) => void;
}) {
  const app = (String(config.app || "") as AppKey) || "googleSheets";
  const actions = ACTIONS[app] || [];
  const action = String(config.action || "") || actions[0]?.key || "";

  const actionOptions = useMemo<SelectOption[]>(
    () =>
      actions.map((a) => ({
        value: a.key,
        label: a.label,
        description: a.description,
      })),
    [actions]
  );

  const selected = actions.find((a) => a.key === action) || null;
  const baseFields = BASE_FIELDS[app] || [];
  const fields = [...baseFields, ...(selected?.fields || [])];

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <div className="block text-xs font-bold text-muted">App</div>
        <Select
          value={app}
          options={APP_OPTIONS}
          onChange={(v) => {
            const nextApp = v as AppKey;
            const nextAction = ACTIONS[nextApp]?.[0]?.key || "";
            onPatch({ app: nextApp, action: nextAction });
          }}
          searchable
          searchPlaceholder="Search apps..."
          placeholder="Select an app..."
        />
      </div>

      <div className="space-y-2">
        <div className="block text-xs font-bold text-muted">Action</div>
        <Select
          value={action}
          options={actionOptions}
          onChange={(v) => onPatch({ action: v })}
          searchable
          searchPlaceholder={`Search ${app === "gmail" ? "Gmail" : app === "github" ? "GitHub" : "Google Sheets"} actions...`}
          placeholder="Select an action..."
        />
      </div>

      <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
        {fields.map((field) => (
          <FieldRow key={field.key} field={field} value={config[field.key]} onChange={(v) => onPatch({ [field.key]: v })} />
        ))}
      </form>
    </div>
  );
}
