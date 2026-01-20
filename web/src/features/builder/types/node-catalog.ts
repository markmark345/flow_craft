import { BuilderNodeType, FlowNodeData } from ".";
import { NodeCatalogItem, NodeCategory, NodeField, NodeFieldType, NodeAccent } from "../nodeCatalog/definitions";
import { triggers } from "../nodeCatalog/nodes/triggers";
import { actions } from "../nodeCatalog/nodes/actions";
import { logic } from "../nodeCatalog/nodes/logic";
import { models } from "../nodeCatalog/nodes/models";
import { legacy } from "../nodeCatalog/nodes/legacy";

export type { NodeCatalogItem, NodeCategory, NodeField, NodeFieldType, NodeAccent };

export const NODE_CATALOG: Record<BuilderNodeType, NodeCatalogItem> = {
  ...triggers,
  ...actions,
  ...logic,
  ...models,
  ...legacy,
} as Record<BuilderNodeType, NodeCatalogItem>;

export const NODE_CATEGORIES: Array<{ id: NodeCategory; label: string; items: NodeCatalogItem[] }> = [
  { 
    id: "Triggers", 
    label: "Triggers", 
    items: Object.values(NODE_CATALOG).filter((n) => n.category === "Triggers") 
  },
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

