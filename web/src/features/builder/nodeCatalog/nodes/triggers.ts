
import { BuilderNodeType } from "@/features/builder/types";
import { NodeCatalogItem } from "../definitions";

export const triggers: Record<string, NodeCatalogItem> = {
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
    validate: (node) => typeof node.config.path === "string" && (node.config.path as string).length > 0,
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
    validate: (node) => typeof node.config.path === "string" && (node.config.path as string).length > 0,
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
    validate: (node) => typeof node.config.expression === "string" && (node.config.expression as string).length > 0,
  },
};
