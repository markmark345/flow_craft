
import { BuilderNodeType } from "@/features/builder/types";
import { NodeCatalogItem } from "../definitions";

export const models: Record<string, NodeCatalogItem> = {
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
      const cfg = node.config as Record<string, unknown>;
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
      const cfg = node.config as Record<string, unknown>;
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
      const cfg = node.config as Record<string, unknown>;
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
      const cfg = node.config as Record<string, unknown>;
      const model = typeof cfg?.model === "string" ? String(cfg.model).trim() : "";
      const credentialId = typeof cfg?.credentialId === "string" ? String(cfg.credentialId).trim() : "";
      const apiKey = typeof cfg?.apiKey === "string" ? String(cfg.apiKey).trim() : "";
      return model.length > 0 && (credentialId.length > 0 || apiKey.length > 0);
    },
  },
};
