export type UserDTO = {
  id: string;
  name: string;
  email: string;
};

export type ProjectRefDTO = {
  id: string;
  name: string;
};

export type ProjectDTO = {
  id: string;
  name: string;
  description?: string;
  role?: "admin" | "member";
  createdAt?: string;
  updatedAt?: string;
};

export type ProjectMemberDTO = {
  user: UserDTO;
  role: "admin" | "member";
};

export type FlowDTO = {
  id: string;
  name: string;
  description?: string;
  scope?: "personal" | "project";
  projectId?: string;
  project?: ProjectRefDTO;
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

export type CredentialDTO = {
  id: string;
  provider: string;
  name: string;
  scope: "personal" | "project";
  projectId?: string;
  accountEmail?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type VariableDTO = {
  id: string;
  key: string;
  value: string;
  scope: "personal" | "project";
  projectId?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type RunStatsDTO = {
  total: number;
  success: number;
  failed: number;
  running: number;
  queued: number;
};
