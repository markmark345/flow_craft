import { BuilderNodeType, FlowNodeData } from ".";
import { isValidAgentModelConfig } from "./agent";

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
  provider?: string;
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
  validate?: (node: FlowNodeData) => boolean;
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
    validate: (node) => typeof node.config.path === "string" && node.config.path.length > 0,
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
    validate: (node) => typeof node.config.path === "string" && node.config.path.length > 0,
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
    validate: (node) => typeof node.config.expression === "string" && node.config.expression.length > 0,
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
    validate: (node) => typeof node.config.url === "string" && node.config.url.length > 0,
  },
  aiAgent: {
    type: "aiAgent",
    label: "AI Agent",
    category: "Actions",
    description: "Generate text with an AI model",
    accent: "neutral",
    op: "ai.agent",
    fields: [
      {
        key: "systemPrompt",
        label: "System prompt (optional)",
        type: "textarea",
        placeholder: "You are a helpful assistant.",
      },
      {
        key: "prompt",
        label: "Prompt",
        type: "textarea",
        placeholder: "Write something... {{input}}",
        helpText: "Use {{input}} to include the previous node output in the prompt.",
      },
      {
        key: "temperature",
        label: "Temperature",
        type: "number",
        placeholder: "0.7",
        helpText: "Higher = more creative, lower = more deterministic.",
      },
      {
        key: "maxTokens",
        label: "Max tokens",
        type: "number",
        placeholder: "512",
      },
    ],
    defaultConfig: {
      systemPrompt: "",
      prompt: "{{input}}",
      temperature: 0.7,
      maxTokens: 512,
    },
    validate: (node) => isValidAgentModelConfig(node.model),
  },
  chatModel: {
    type: "chatModel",
    label: "Chat Model",
    category: "Utilities",
    description: "Provide a model connection for AI Agent",
    accent: "neutral",
    op: "ai.model",
    fields: [],
    defaultConfig: {
      provider: "openai",
      credentialId: "",
      apiKey: "",
      model: "gpt-4o-mini",
      baseUrl: "https://api.openai.com/v1",
    },
    validate: (node) => {
      const cfg = node.config as any;
      const provider = typeof cfg?.provider === "string" ? String(cfg.provider).trim() : "";
      const model = typeof cfg?.model === "string" ? String(cfg.model).trim() : "";
      const credentialId = typeof cfg?.credentialId === "string" ? String(cfg.credentialId).trim() : "";
      const apiKey = typeof cfg?.apiKey === "string" ? String(cfg.apiKey).trim() : "";
      return provider.length > 0 && model.length > 0 && (credentialId.length > 0 || apiKey.length > 0);
    },
  },
  openaiChatModel: {
    type: "openaiChatModel",
    label: "OpenAI Chat Model",
    category: "Utilities",
    description: "Provide an OpenAI model connection for AI Agent",
    accent: "neutral",
    op: "ai.model.openai",
    fields: [
      {
        key: "credentialId",
        label: "Credential (optional)",
        type: "credential",
        provider: "openai",
        helpText: "Create an OpenAI credential in Credentials (API key).",
      },
      {
        key: "apiKey",
        label: "API key (optional)",
        type: "text",
        placeholder: "sk-...",
        helpText: "If set, overrides the credential API key.",
      },
      { key: "model", label: "Model", type: "text", placeholder: "gpt-4o-mini", required: true },
      {
        key: "baseUrl",
        label: "Base URL (optional)",
        type: "text",
        placeholder: "https://api.openai.com/v1",
      },
    ],
    defaultConfig: { credentialId: "", apiKey: "", model: "gpt-4o-mini", baseUrl: "https://api.openai.com/v1" },
    validate: (node) => {
      const cfg = node.config as any;
      const model = typeof cfg?.model === "string" ? String(cfg.model).trim() : "";
      const credentialId = typeof cfg?.credentialId === "string" ? String(cfg.credentialId).trim() : "";
      const apiKey = typeof cfg?.apiKey === "string" ? String(cfg.apiKey).trim() : "";
      return model.length > 0 && (credentialId.length > 0 || apiKey.length > 0);
    },
  },
  geminiChatModel: {
    type: "geminiChatModel",
    label: "Gemini Chat Model",
    category: "Utilities",
    description: "Provide a Gemini model connection for AI Agent",
    accent: "neutral",
    op: "ai.model.gemini",
    fields: [
      {
        key: "credentialId",
        label: "Credential (optional)",
        type: "credential",
        provider: "gemini",
        helpText: "Create a Gemini credential in Credentials (API key).",
      },
      {
        key: "apiKey",
        label: "API key (optional)",
        type: "text",
        placeholder: "AIza...",
        helpText: "If set, overrides the credential API key.",
      },
      { key: "model", label: "Model", type: "text", placeholder: "gemini-1.5-flash", required: true },
      {
        key: "baseUrl",
        label: "Base URL (optional)",
        type: "text",
        placeholder: "https://generativelanguage.googleapis.com",
      },
    ],
    defaultConfig: {
      credentialId: "",
      apiKey: "",
      model: "gemini-1.5-flash",
      baseUrl: "https://generativelanguage.googleapis.com",
    },
    validate: (node) => {
      const cfg = node.config as any;
      const model = typeof cfg?.model === "string" ? String(cfg.model).trim() : "";
      const credentialId = typeof cfg?.credentialId === "string" ? String(cfg.credentialId).trim() : "";
      const apiKey = typeof cfg?.apiKey === "string" ? String(cfg.apiKey).trim() : "";
      return model.length > 0 && (credentialId.length > 0 || apiKey.length > 0);
    },
  },
  grokChatModel: {
    type: "grokChatModel",
    label: "Grok Chat Model",
    category: "Utilities",
    description: "Provide a Grok model connection for AI Agent",
    accent: "neutral",
    op: "ai.model.grok",
    fields: [
      {
        key: "credentialId",
        label: "Credential (optional)",
        type: "credential",
        provider: "grok",
        helpText: "Create a Grok credential in Credentials (API key).",
      },
      {
        key: "apiKey",
        label: "API key (optional)",
        type: "text",
        placeholder: "xai-...",
        helpText: "If set, overrides the credential API key.",
      },
      { key: "model", label: "Model", type: "text", placeholder: "grok-2-latest", required: true },
      {
        key: "baseUrl",
        label: "Base URL (optional)",
        type: "text",
        placeholder: "https://api.x.ai/v1",
      },
    ],
    defaultConfig: { credentialId: "", apiKey: "", model: "grok-2-latest", baseUrl: "https://api.x.ai/v1" },
    validate: (node) => {
      const cfg = node.config as any;
      const model = typeof cfg?.model === "string" ? String(cfg.model).trim() : "";
      const credentialId = typeof cfg?.credentialId === "string" ? String(cfg.credentialId).trim() : "";
      const apiKey = typeof cfg?.apiKey === "string" ? String(cfg.apiKey).trim() : "";
      return model.length > 0 && (credentialId.length > 0 || apiKey.length > 0);
    },
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
    validate: (node) => {
      const cfg = node.config as any;
      const app = typeof cfg?.app === "string" ? String(cfg.app).trim() : "";
      const action = typeof cfg?.action === "string" ? String(cfg.action).trim() : "";
      const credentialId = typeof cfg?.credentialId === "string" ? String(cfg.credentialId).trim() : "";
      const apiKey = typeof cfg?.apiKey === "string" ? String(cfg.apiKey).trim() : "";
      const appKey = app.toLowerCase();
      if (appKey === "bannerbear" || appKey === "bananabear") {
        return app.length > 0 && action.length > 0 && (credentialId.length > 0 || apiKey.length > 0);
      }
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
    validate: (node) => {
      const cfg = node.config as any;
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
      const cfg = node.config as any;
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
      const cfg = node.config as any;
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
    validate: (node) => {
      const cfg = node.config as any;
      return (
        typeof cfg.connection === "string" &&
        cfg.connection.length > 0 &&
        typeof cfg.channelId === "string" &&
        cfg.channelId.length > 0 &&
        typeof cfg.message === "string" &&
        cfg.message.length > 0
      );
    },
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
    validate: (node) => {
      const cfg = node.config as any;
      const raw = cfg?.conditions;
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
  {
    id: "Utilities",
    label: "Utilities",
    items: Object.values(NODE_CATALOG).filter(
      (n) =>
        n.category === "Utilities" &&
        // Keep legacy nodes working for existing flows, but hide them from the palette.
        n.type !== "chatModel" &&
        n.type !== "openaiChatModel" &&
        n.type !== "geminiChatModel" &&
        n.type !== "grokChatModel"
    ),
  },
];

export function createDefaultNodeData(nodeType: BuilderNodeType, label?: string): FlowNodeData {
  const meta = NODE_CATALOG[nodeType];
  if (nodeType === "chatModel" && !label) {
    const provider = typeof meta.defaultConfig.provider === "string" ? meta.defaultConfig.provider : "openai";
    const providerLabel =
      provider === "gemini" ? "Gemini" : provider === "grok" ? "Grok" : provider === "openai" ? "OpenAI" : "Chat";
    label = `${providerLabel} Chat Model`;
  }
  const base: FlowNodeData = {
    nodeType,
    label: label || meta.label,
    description: meta.description,
    config: { ...meta.defaultConfig },
  };
  if (nodeType === "aiAgent") {
    return {
      ...base,
      model: null,
      memory: null,
      tools: [],
    };
  }
  return base;
}
