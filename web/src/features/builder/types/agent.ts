export type AgentModelProvider = "openai" | "gemini" | "grok" | "custom";

export type AgentModelConfig = {
  provider: AgentModelProvider;
  credentialId?: string;
  apiKeyOverride?: string;
  model: string;
  baseUrl?: string;
};

export type AgentMemoryType = "none" | "conversation" | "vector";

export type AgentMemoryConfig = {
  type: AgentMemoryType;
  config: Record<string, unknown>;
};

export type AgentToolConfig = {
  id: string;
  toolKey: string;
  enabled: boolean;
  credentialId?: string;
  config: Record<string, unknown>;
};

export function isValidAgentModelConfig(cfg: unknown): cfg is AgentModelConfig {
  if (!cfg || typeof cfg !== "object") return false;
  const provider = typeof (cfg as any).provider === "string" ? String((cfg as any).provider).trim() : "";
  const model = typeof (cfg as any).model === "string" ? String((cfg as any).model).trim() : "";
  const credentialId =
    typeof (cfg as any).credentialId === "string" ? String((cfg as any).credentialId).trim() : "";
  const apiKeyOverride =
    typeof (cfg as any).apiKeyOverride === "string" ? String((cfg as any).apiKeyOverride).trim() : "";
  return provider.length > 0 && model.length > 0 && (credentialId.length > 0 || apiKeyOverride.length > 0);
}

