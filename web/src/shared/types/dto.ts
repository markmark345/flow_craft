export type UserDTO = {
  id: string;
  name: string;
  email: string;
};

export type FlowDTO = {
  id: string;
  name: string;
  status: "draft" | "active" | "archived";
  version: number;
  definitionJson?: string;
  updatedAt?: string;
  owner?: UserDTO;
};

export type RunDTO = {
  id: string;
  flowId: string;
  status: "queued" | "running" | "success" | "failed" | "canceled";
  startedAt?: string;
  finishedAt?: string;
  log?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type RunStepDTO = {
  id: string;
  runId: string;
  stepKey: string;
  name: string;
  status: "queued" | "running" | "success" | "failed" | "canceled" | "skipped";
  nodeId?: string;
  nodeType?: string;
  startedAt?: string;
  finishedAt?: string;
  inputs?: unknown;
  outputs?: unknown;
  log?: string;
  error?: string;
  createdAt?: string;
  updatedAt?: string;
};
