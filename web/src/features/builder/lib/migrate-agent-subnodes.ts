import type { Edge, Node } from "reactflow";

import type { FlowNodeData } from "../types";
import { isValidAgentModelConfig, type AgentMemoryConfig, type AgentModelConfig, type AgentToolConfig } from "../types/agent";

export type AgentSubnodeMigrationResult = {
  nodes: Node<FlowNodeData>[];
  edges: Edge[];
  didMigrate: boolean;
};

const LEGACY_SUBNODE_EDGE_HANDLES = new Set(["model", "memory", "tool"]);
const LEGACY_MODEL_NODE_TYPES = new Set(["chatModel", "openaiChatModel", "geminiChatModel", "grokChatModel"]);

function isLegacyModelNode(node: Node<FlowNodeData> | undefined) {
  return Boolean(node && node.data && LEGACY_MODEL_NODE_TYPES.has(node.data.nodeType));
}

function normalizeAgentModelFromConfig(raw: unknown): AgentModelConfig | null {
  if (!raw || typeof raw !== "object") return null;
  const provider = typeof (raw as any).provider === "string" ? String((raw as any).provider).trim().toLowerCase() : "";
  const credentialId =
    typeof (raw as any).credentialId === "string" ? String((raw as any).credentialId).trim() : undefined;
  const apiKeyOverrideRaw = (raw as any).apiKeyOverride ?? (raw as any).apiKey;
  const apiKeyOverride =
    typeof apiKeyOverrideRaw === "string" ? String(apiKeyOverrideRaw).trim() : undefined;
  const model = typeof (raw as any).model === "string" ? String((raw as any).model).trim() : "";
  const baseUrl = typeof (raw as any).baseUrl === "string" ? String((raw as any).baseUrl).trim() : undefined;

  const cfg: AgentModelConfig = {
    provider: (provider || "openai") as any,
    model,
    credentialId: credentialId || undefined,
    apiKeyOverride: apiKeyOverride || undefined,
    baseUrl: baseUrl || undefined,
  };
  const hasAny =
    Boolean(provider) ||
    Boolean(model) ||
    Boolean(credentialId && credentialId.trim()) ||
    Boolean(apiKeyOverride && apiKeyOverride.trim()) ||
    Boolean(baseUrl && baseUrl.trim());
  return hasAny ? cfg : null;
}

function normalizeAgentMemoryFromConfig(raw: unknown): AgentMemoryConfig | null {
  if (!raw || typeof raw !== "object") return null;
  const type = typeof (raw as any).type === "string" ? String((raw as any).type).trim().toLowerCase() : "";
  if (!type || type === "none") return null;
  const cfg = (raw as any).config && typeof (raw as any).config === "object" ? (raw as any).config : {};
  return { type: type as any, config: cfg };
}

function normalizeAgentTools(raw: unknown): AgentToolConfig[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item): AgentToolConfig | null => {
      if (!item || typeof item !== "object") return null;
      const toolKey = typeof (item as any).toolKey === "string" ? String((item as any).toolKey).trim() : "";
      if (!toolKey) return null;
      const id =
        typeof (item as any).id === "string" && String((item as any).id).trim()
          ? String((item as any).id).trim()
          : crypto.randomUUID();
      const enabled = (item as any).enabled === undefined ? true : Boolean((item as any).enabled);
      const credentialId =
        typeof (item as any).credentialId === "string" ? String((item as any).credentialId).trim() : undefined;
      const cfg = (item as any).config && typeof (item as any).config === "object" ? (item as any).config : {};
      return { id, toolKey, enabled, credentialId: credentialId || undefined, config: cfg };
    })
    .filter(Boolean) as AgentToolConfig[];
}

function toAgentModelFromLegacyModelNode(node: Node<FlowNodeData>): AgentModelConfig | null {
  if (!node?.data) return null;
  const cfg = node.data.config || {};
  if (!isLegacyModelNode(node)) return null;
  const provider = typeof (cfg as any).provider === "string" ? String((cfg as any).provider).trim().toLowerCase() : "";
  const credentialId = typeof (cfg as any).credentialId === "string" ? String((cfg as any).credentialId).trim() : "";
  const apiKeyOverride = typeof (cfg as any).apiKey === "string" ? String((cfg as any).apiKey).trim() : "";
  const model = typeof (cfg as any).model === "string" ? String((cfg as any).model).trim() : "";
  const baseUrl = typeof (cfg as any).baseUrl === "string" ? String((cfg as any).baseUrl).trim() : "";

  const modelCfg: AgentModelConfig = {
    provider: (provider || "openai") as any,
    credentialId: credentialId || undefined,
    apiKeyOverride: apiKeyOverride || undefined,
    model,
    baseUrl: baseUrl || undefined,
  };
  const hasAny = Boolean(provider) || Boolean(model) || Boolean(credentialId) || Boolean(apiKeyOverride) || Boolean(baseUrl);
  return hasAny ? modelCfg : null;
}

function omitKeys(base: Record<string, unknown>, keys: string[]): Record<string, unknown> {
  const next: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(base)) {
    if (keys.includes(k)) continue;
    next[k] = v;
  }
  return next;
}

export function migrateAgentSubnodes(
  nodes: Node<FlowNodeData>[],
  edges: Edge[]
): AgentSubnodeMigrationResult {
  let didMigrate = false;
  const nodeById = new Map<string, Node<FlowNodeData>>();
  for (const node of nodes) nodeById.set(node.id, node);

  const updatedNodes = nodes.map((node) => {
    if (node.data?.nodeType !== "aiAgent") return node;

    const cfg = node.data.config || {};
    const patch: Partial<FlowNodeData> = {};
    let nextConfig = cfg;

    const model = node.data.model ?? undefined;
    const memory = node.data.memory ?? undefined;
    const tools = node.data.tools ?? undefined;

    if (model === undefined && "model" in cfg && (cfg as any).model && typeof (cfg as any).model === "object") {
      const migrated = normalizeAgentModelFromConfig((cfg as any).model);
      patch.model = migrated;
      didMigrate = true;
      nextConfig = omitKeys(nextConfig, ["model"]);
    }

    if (memory === undefined && "memory" in cfg) {
      const migrated = normalizeAgentMemoryFromConfig((cfg as any).memory);
      patch.memory = migrated;
      didMigrate = true;
      nextConfig = omitKeys(nextConfig, ["memory"]);
    }

    if (tools === undefined && "tools" in cfg) {
      const migrated = normalizeAgentTools((cfg as any).tools);
      patch.tools = migrated;
      didMigrate = didMigrate || migrated.length > 0;
      nextConfig = omitKeys(nextConfig, ["tools"]);
    }

    if (Array.isArray(tools)) {
      const normalized = normalizeAgentTools(tools);
      if (JSON.stringify(normalized) !== JSON.stringify(tools)) {
        patch.tools = normalized;
        didMigrate = true;
      }
    }

    if (Object.keys(patch).length === 0 && nextConfig === cfg) return node;

    return {
      ...node,
      data: {
        ...node.data,
        ...patch,
        config: nextConfig,
      },
    };
  });

  const updatedById = new Map<string, Node<FlowNodeData>>();
  for (const node of updatedNodes) updatedById.set(node.id, node);

  const modelNodeIdsToRemove = new Set<string>();
  const cleanedEdges: Edge[] = [];

  for (const edge of edges) {
    const handle = typeof edge.targetHandle === "string" ? edge.targetHandle.trim().toLowerCase() : "";
    if (!handle || !LEGACY_SUBNODE_EDGE_HANDLES.has(handle)) {
      cleanedEdges.push(edge);
      continue;
    }

    const target = updatedById.get(edge.target);
    if (!target || target.data.nodeType !== "aiAgent") {
      cleanedEdges.push(edge);
      continue;
    }

    didMigrate = true;

    if (handle === "model") {
      const source = nodeById.get(edge.source);
      if (source) {
        const modelCfg = toAgentModelFromLegacyModelNode(source);
        if (modelCfg && !isValidAgentModelConfig(target.data.model)) {
          updatedById.set(edge.target, {
            ...target,
            data: {
              ...target.data,
              model: modelCfg,
            },
          });
        }
        if (isLegacyModelNode(source)) modelNodeIdsToRemove.add(source.id);
      }
    }
  }

  const removedIds = new Set<string>(modelNodeIdsToRemove);
  const finalNodes = Array.from(updatedById.values()).filter((node) => !removedIds.has(node.id));
  const finalEdges = cleanedEdges.filter((e) => !removedIds.has(e.source) && !removedIds.has(e.target));

  return { nodes: finalNodes, edges: finalEdges, didMigrate };
}
