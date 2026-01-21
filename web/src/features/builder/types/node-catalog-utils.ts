import { BuilderNodeType, FlowNodeData } from ".";
import { NODE_CATALOG } from "./node-catalog";

export function createDefaultNodeData(nodeType: BuilderNodeType, label?: string): FlowNodeData {
  const meta = NODE_CATALOG[nodeType];
  if (!meta) {
    // Fallback for unknown node types or if catalog isn't fully loaded yet
    return {
        nodeType,
        label: label || nodeType,
        description: "",
        config: {},
    };
  }

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
