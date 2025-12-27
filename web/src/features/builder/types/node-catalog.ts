import { BuilderNodeType, FlowNodeData } from ".";

export type NodeFieldType = "text" | "number" | "textarea" | "select" | "toggle" | "keyValue" | "credential";

export type NodeField = {
  key: string;
  label: string;
  type: NodeFieldType;
  placeholder?: string;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
  options?: string[];
  required?: boolean;
  helpText?: string;
  provider?: "google" | "github";
};

export type NodeCategory = "Triggers" | "Actions" | "Utilities";

export type NodeAccent = "accent" | "success" | "warning" | "error" | "trigger" | "slack" | "neutral";

export type NodeCatalogItem = {
  type: BuilderNodeType;
  label: string;
  category: NodeCategory;
  description: string;
  accent: NodeAccent;
  op?: string;
  validate?: (config: Record<string, unknown>) => boolean;
  fields: NodeField[];
  defaultConfig: Record<string, unknown>;
};

export const NODE_CATALOG: Record<BuilderNodeType, NodeCatalogItem> = {
  httpTrigger: {
    type: "httpTrigger",
    label: "HTTP Trigger",
    category: "Triggers",
    description: "Start the flow from an incoming HTTP request",
    accent: "trigger",
    op: "http.trigger",
    fields: [
      { key: "path", label: "Path", type: "text", placeholder: "/incoming" },
      { key: "method", label: "Method", type: "select", options: ["GET", "POST", "PUT", "DELETE"] },
    ],
    defaultConfig: { path: "/incoming", method: "POST" },
    validate: (cfg) => typeof cfg.path === "string" && cfg.path.length > 0,
  },
  errorTrigger: {
    type: "errorTrigger",
    label: "Error Trigger",
    category: "Triggers",
    description: "Run when a node fails and routes to the error trigger",
    accent: "error",
    op: "trigger.error",
    fields: [],
    defaultConfig: {},
  },
  webhook: {
    type: "webhook",
    label: "Webhook",
    category: "Triggers",
    description: "Receive events from external services",
    accent: "trigger",
    op: "webhook.receive",
    fields: [
      { key: "path", label: "Path", type: "text", placeholder: "/webhook" },
      { key: "secret", label: "Secret", type: "text", placeholder: "optional" },
    ],
    defaultConfig: { path: "/webhook", secret: "" },
    validate: (cfg) => typeof cfg.path === "string" && cfg.path.length > 0,
  },
  cron: {
    type: "cron",
    label: "Schedule",
    category: "Triggers",
    description: "Run on a schedule",
    accent: "trigger",
    op: "schedule.cron",
    fields: [{ key: "expression", label: "Expression", type: "text", placeholder: "0 * * * *" }],
    defaultConfig: { expression: "0 * * * *" },
    validate: (cfg) => typeof cfg.expression === "string" && cfg.expression.length > 0,
  },
  httpRequest: {
    type: "httpRequest",
    label: "HTTP Request",
    category: "Actions",
    description: "External API call",
    accent: "accent",
    op: "http.request",
    fields: [
      { key: "url", label: "URL", type: "text", placeholder: "https://api.example.com" },
      { key: "method", label: "Method", type: "select", options: ["GET", "POST", "PUT", "DELETE"] },
      {
        key: "queryParams",
        label: "Query Parameters",
        type: "keyValue",
        keyPlaceholder: "key",
        valuePlaceholder: "value",
      },
      {
        key: "headers",
        label: "Headers",
        type: "keyValue",
        keyPlaceholder: "Header",
        valuePlaceholder: "Value",
      },
      { key: "body", label: "Body", type: "textarea", placeholder: "{\"hello\":\"world\"}" },
    ],
    defaultConfig: { url: "", method: "GET", queryParams: [], headers: [], body: "" },
    validate: (cfg) => typeof cfg.url === "string" && cfg.url.length > 0,
  },
  app: {
    type: "app",
    label: "Action in an app",
    category: "Actions",
    description: "Do something in an external app (Google, GitHub, ...)",
    accent: "neutral",
    op: "app.action",
    fields: [],
    defaultConfig: {
      app: "googleSheets",
      action: "gsheets.appendRow",
      credentialId: "",
      spreadsheetId: "",
      sheetName: "Sheet1",
      values: "",
    },
    validate: (cfg) => {
      const app = typeof (cfg as any)?.app === "string" ? String((cfg as any).app).trim() : "";
      const action = typeof (cfg as any)?.action === "string" ? String((cfg as any).action).trim() : "";
      const credentialId =
        typeof (cfg as any)?.credentialId === "string" ? String((cfg as any).credentialId).trim() : "";
      return app.length > 0 && action.length > 0 && credentialId.length > 0;
    },
  },
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
    validate: (cfg) =>
      typeof cfg.credentialId === "string" &&
      cfg.credentialId.length > 0 &&
      typeof cfg.to === "string" &&
      cfg.to.length > 0 &&
      typeof cfg.subject === "string" &&
      cfg.subject.length > 0,
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
    validate: (cfg) =>
      typeof cfg.credentialId === "string" &&
      cfg.credentialId.length > 0 &&
      typeof cfg.spreadsheetId === "string" &&
      cfg.spreadsheetId.length > 0 &&
      ((typeof cfg.values === "string" && cfg.values.length > 0) || Array.isArray(cfg.values)),
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
    validate: (cfg) =>
      typeof cfg.credentialId === "string" &&
      cfg.credentialId.length > 0 &&
      typeof cfg.owner === "string" &&
      cfg.owner.length > 0 &&
      typeof cfg.repo === "string" &&
      cfg.repo.length > 0 &&
      typeof cfg.title === "string" &&
      cfg.title.length > 0,
  },
  slack: {
    type: "slack",
    label: "Slack",
    category: "Actions",
    description: "Send notification",
    accent: "slack",
    op: "slack.post_message",
    fields: [
      {
        key: "actionType",
        label: "Action Type",
        type: "select",
        options: ["Post Message", "Upload File", "Create Channel"],
        required: true,
      },
      {
        key: "connection",
        label: "Slack Connection",
        type: "select",
        options: ["My Workspace (Default)", "Marketing Team"],
        required: true,
      },
      {
        key: "channelId",
        label: "Channel ID",
        type: "text",
        placeholder: "#vip-orders",
        required: true,
      },
      {
        key: "message",
        label: "Message Text",
        type: "textarea",
        placeholder: "Enter your message...",
        required: true,
      },
      { key: "sendAsBot", label: "Send as bot user", type: "toggle" },
    ],
    defaultConfig: {
      actionType: "Post Message",
      connection: "My Workspace (Default)",
      channelId: "",
      message: "",
      sendAsBot: true,
    },
    validate: (cfg) =>
      typeof cfg.connection === "string" &&
      cfg.connection.length > 0 &&
      typeof cfg.channelId === "string" &&
      cfg.channelId.length > 0 &&
      typeof cfg.message === "string" &&
      cfg.message.length > 0,
  },
  transform: {
    type: "transform",
    label: "Run JS",
    category: "Actions",
    description: "Custom code block",
    accent: "neutral",
    op: "code.run_js",
    fields: [{ key: "script", label: "Script", type: "textarea", placeholder: "return input;" }],
    defaultConfig: { script: "" },
  },
  database: {
    type: "database",
    label: "Database",
    category: "Actions",
    description: "Run a database query",
    accent: "success",
    op: "db.query",
    fields: [{ key: "query", label: "Query", type: "textarea", placeholder: "SELECT * FROM table;" }],
    defaultConfig: { query: "" },
  },
  delay: {
    type: "delay",
    label: "Delay",
    category: "Utilities",
    description: "Wait before continuing",
    accent: "warning",
    op: "util.delay",
    fields: [{ key: "seconds", label: "Seconds", type: "number", placeholder: "5" }],
    defaultConfig: { seconds: 5 },
  },
  if: {
    type: "if",
    label: "If",
    category: "Utilities",
    description: "Branch based on conditions",
    accent: "neutral",
    op: "logic.condition",
    fields: [],
    defaultConfig: {
      combine: "AND",
      conditions: [{ id: "cond_1", type: "string", operator: "is equal to", left: "", right: "" }],
      ignoreCase: false,
      convertTypes: false,
    },
    validate: (cfg) => {
      const raw = (cfg as any)?.conditions;
      if (!Array.isArray(raw) || raw.length === 0) return false;
      const first = raw[0];
      if (!first || typeof first !== "object") return false;
      const left = "left" in (first as any) ? String((first as any).left || "").trim() : "";
      const operator = "operator" in (first as any) ? String((first as any).operator || "").trim() : "";
      return left.length > 0 && operator.length > 0;
    },
  },
  merge: {
    type: "merge",
    label: "Merge",
    category: "Utilities",
    description: "Combine outputs from multiple steps",
    accent: "accent",
    op: "util.merge",
    fields: [],
    defaultConfig: {},
  },
  switch: {
    type: "switch",
    label: "Switch",
    category: "Utilities",
    description: "Route based on a value",
    accent: "accent",
    op: "logic.switch",
    fields: [{ key: "expression", label: "Expression", type: "text", placeholder: "input.status" }],
    defaultConfig: { expression: "" },
  },
};

export const NODE_CATEGORIES: Array<{ id: NodeCategory; label: string; items: NodeCatalogItem[] }> = [
  { id: "Triggers", label: "Triggers", items: Object.values(NODE_CATALOG).filter((n) => n.category === "Triggers") },
  {
    id: "Actions",
    label: "Actions",
    items: Object.values(NODE_CATALOG).filter(
      (n) =>
        n.category === "Actions" &&
        // Keep legacy nodes working for existing flows, but hide them from the palette
        // now that we have the unified "Action in an app" node.
        n.type !== "gmail" &&
        n.type !== "gsheets" &&
        n.type !== "github"
    ),
  },
  { id: "Utilities", label: "Utilities", items: Object.values(NODE_CATALOG).filter((n) => n.category === "Utilities") },
];

export function createDefaultNodeData(nodeType: BuilderNodeType, label?: string): FlowNodeData {
  const meta = NODE_CATALOG[nodeType];
  return {
    nodeType,
    label: label || meta.label,
    description: meta.description,
    config: { ...meta.defaultConfig },
  };
}
