import { Edge, Node, Viewport } from "reactflow";

export type BuilderNodeType =
  | "httpTrigger"
  | "webhook"
  | "cron"
  | "httpRequest"
  | "slack"
  | "transform"
  | "database"
  | "delay"
  | "if"
  | "switch";

export type FlowNodeData = {
  nodeType: BuilderNodeType;
  label: string;
  description?: string;
  config: Record<string, unknown>;
  notes?: string;
  runtimeStatus?: "queued" | "running" | "success" | "failed" | "canceled" | "skipped";
  runtimeStepKey?: string;
  runtimePulse?: boolean;
};

export type StickyNote = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: "yellow" | "blue" | "green";
  text: string;
  collapsed: boolean;
  createdAt?: string;
  createdBy?: {
    id: string;
    name: string;
    email: string;
  };
  updatedAt?: string;
  updatedBy?: {
    id: string;
    name: string;
    email: string;
  };
};

export type SerializedFlow = {
  id: string;
  name: string;
  version: number;
  reactflow: {
    nodes: Node<FlowNodeData>[];
    edges: Edge[];
    viewport: Viewport;
  };
  notes: StickyNote[];
};
