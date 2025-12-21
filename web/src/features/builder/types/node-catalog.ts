import { BuilderNodeType, FlowNodeData } from ".";

export type NodeFieldType = "text" | "number" | "textarea" | "select" | "toggle" | "keyValue";

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
  { id: "Actions", label: "Actions", items: Object.values(NODE_CATALOG).filter((n) => n.category === "Actions") },
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
