
import { BuilderNodeType } from "@/features/builder/types";
import { isValidAgentModelConfig } from "@/features/builder/types/agent";
import { NodeCatalogItem } from "../definitions";

export const actions: Record<string, NodeCatalogItem> = {
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
    validate: (node) => typeof node.config.url === "string" && (node.config.url as string).length > 0,
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
      const cfg = node.config as Record<string, unknown>;
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
      const cfg = node.config as Record<string, unknown>;
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
};
