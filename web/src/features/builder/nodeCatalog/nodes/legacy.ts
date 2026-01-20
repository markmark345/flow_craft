
import { BuilderNodeType } from "@/features/builder/types";
import { NodeCatalogItem } from "../definitions";

export const legacy: Record<string, NodeCatalogItem> = {
  gmail: {
    type: "gmail",
    label: "Gmail Send",
    category: "Actions",
    description: "Send an email with Gmail",
    accent: "accent",
    op: "gmail.send_email",
    fields: [
      {
        key: "credentialId",
        label: "Credential",
        type: "credential",
        provider: "google",
        required: true,
        helpText: "Connect a Google account in Credentials to send mail.",
      },
      { key: "from", label: "From (optional)", type: "text", placeholder: "me@company.com" },
      { key: "to", label: "To", type: "text", placeholder: "recipient@company.com", required: true },
      { key: "subject", label: "Subject", type: "text", placeholder: "Hello from FlowCraft", required: true },
      { key: "bodyText", label: "Body (text)", type: "textarea", placeholder: "Write a plain-text message..." },
      { key: "bodyHtml", label: "Body (HTML)", type: "textarea", placeholder: "<p>Write HTML content...</p>" },
    ],
    defaultConfig: {
      credentialId: "",
      from: "",
      to: "",
      subject: "",
      bodyText: "",
      bodyHtml: "",
    },
    validate: (node) => {
      const cfg = node.config as Record<string, unknown>;
      return (
        typeof cfg.credentialId === "string" &&
        cfg.credentialId.length > 0 &&
        typeof cfg.to === "string" &&
        cfg.to.length > 0 &&
        typeof cfg.subject === "string" &&
        cfg.subject.length > 0
      );
    },
  },
  gsheets: {
    type: "gsheets",
    label: "Google Sheets",
    category: "Actions",
    description: "Append a row to a sheet",
    accent: "success",
    op: "gsheets.append_row",
    fields: [
      {
        key: "credentialId",
        label: "Credential",
        type: "credential",
        provider: "google",
        required: true,
        helpText: "Connect a Google account in Credentials to access Sheets.",
      },
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
    defaultConfig: { credentialId: "", spreadsheetId: "", sheetName: "Sheet1", values: "" },
    validate: (node) => {
      const cfg = node.config as Record<string, unknown>;
      return (
        typeof cfg.credentialId === "string" &&
        cfg.credentialId.length > 0 &&
        typeof cfg.spreadsheetId === "string" &&
        cfg.spreadsheetId.length > 0 &&
        ((typeof cfg.values === "string" && cfg.values.length > 0) || Array.isArray(cfg.values))
      );
    },
  },
  github: {
    type: "github",
    label: "GitHub Issue",
    category: "Actions",
    description: "Create a GitHub issue",
    accent: "neutral",
    op: "github.create_issue",
    fields: [
      {
        key: "credentialId",
        label: "Credential",
        type: "credential",
        provider: "github",
        required: true,
        helpText: "Connect a GitHub account in Credentials to create issues.",
      },
      { key: "owner", label: "Owner", type: "text", placeholder: "octocat", required: true },
      { key: "repo", label: "Repository", type: "text", placeholder: "hello-world", required: true },
      { key: "title", label: "Title", type: "text", placeholder: "Bug report", required: true },
      { key: "body", label: "Body", type: "textarea", placeholder: "Issue details..." },
    ],
    defaultConfig: { credentialId: "", owner: "", repo: "", title: "", body: "" },
    validate: (node) => {
      const cfg = node.config as Record<string, unknown>;
      return (
        typeof cfg.credentialId === "string" &&
        cfg.credentialId.length > 0 &&
        typeof cfg.owner === "string" &&
        cfg.owner.length > 0 &&
        typeof cfg.repo === "string" &&
        cfg.repo.length > 0 &&
        typeof cfg.title === "string" &&
        cfg.title.length > 0
      );
    },
  },
};
