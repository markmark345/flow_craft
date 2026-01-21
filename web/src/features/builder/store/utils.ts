
import type { Node } from "reactflow";
import type { FlowNodeData, StickyNote, BuilderNodeType } from "../types";
import { NODE_CATALOG } from "../types/node-catalog";
import { createDefaultNodeData } from "../types/node-catalog-utils";

export function normalizeNode(node: Node): Node<FlowNodeData> {
  const data = (node.data as Record<string, unknown>) || {};
  const dataNodeType = data?.nodeType;
  const resolved =
    (typeof dataNodeType === "string" && NODE_CATALOG[dataNodeType as BuilderNodeType]
      ? (dataNodeType as BuilderNodeType)
      : undefined) ||
    (NODE_CATALOG[node.type as BuilderNodeType] ? (node.type as BuilderNodeType) : undefined) ||
    "httpRequest";

  const legacyModelProvider = (() => {
    if (resolved === "openaiChatModel") return "openai";
    if (resolved === "geminiChatModel") return "gemini";
    if (resolved === "grokChatModel") return "grok";
    return null;
  })();

  const inferred = legacyModelProvider ? "chatModel" : resolved;

  const defaultLabel =
    legacyModelProvider && typeof data?.label !== "string"
      ? `${legacyModelProvider === "gemini" ? "Gemini" : legacyModelProvider === "grok" ? "Grok" : "OpenAI"} Chat Model`
      : (data?.label as string | undefined);

  const defaults = createDefaultNodeData(inferred, defaultLabel);
  return {
    ...node,
    type: "flowNode",
    data: {
      ...defaults,
      ...data,
      nodeType: inferred,
      config: {
        ...(defaults.config || {}),
        ...((data?.config as Record<string, unknown>) || {}),
        ...(legacyModelProvider ? { provider: legacyModelProvider } : {}),
      },
    },
  };
}

export function normalizeNote(note: unknown): StickyNote | null {
  if (!note || typeof note !== "object") return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const n = note as any; // Temporary cast for property access, verified by typeof checks below
  const id = typeof n.id === "string" && n.id.length ? n.id : crypto.randomUUID();
  const x = typeof n.x === "number" ? n.x : 0;
  const y = typeof n.y === "number" ? n.y : 0;
  const width = typeof n.width === "number" ? n.width : 360;
  const height = typeof n.height === "number" ? n.height : 280;
  const allowedColors: StickyNote["color"][] = ["yellow", "blue", "green"];
  const rawColor = typeof n.color === "string" ? n.color : "";
  let color: StickyNote["color"] = "yellow";
  if (allowedColors.includes(rawColor as StickyNote["color"])) color = rawColor as StickyNote["color"];
  else if (rawColor === "purple") color = "blue";
  else if (rawColor === "pink") color = "yellow";
  const text = typeof n.text === "string" ? n.text : "";
  const collapsed = Boolean(n.collapsed);

  const createdAt = typeof n.createdAt === "string" ? n.createdAt : undefined;
  const updatedAt = typeof n.updatedAt === "string" ? n.updatedAt : undefined;

  const coerceUser = (u: unknown) => {
    if (!u || typeof u !== "object") return undefined;
    const user = u as Record<string, unknown>;
    const id = typeof user.id === "string" ? user.id : "";
    const name = typeof user.name === "string" ? user.name : "";
    const email = typeof user.email === "string" ? user.email : "";
    if (!id || !email) return undefined;
    return { id, name, email };
  };

  const createdBy = coerceUser(n.createdBy);
  const updatedBy = coerceUser(n.updatedBy);

  return { id, x, y, width, height, color, text, collapsed, createdAt, createdBy, updatedAt, updatedBy };
}
