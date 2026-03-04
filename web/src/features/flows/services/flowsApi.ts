import { API_BASE_URL } from "@/lib/env";
import { request } from "@/lib/fetcher";
import { FlowDTO } from "@/types/dto";

type UpdateFlowPayload = {
  name?: string;
  status?: string;
  version?: number;
  definitionJson?: string;
};

type CreateFlowPayload = {
  name: string;
  status?: string;
  version?: number;
  definitionJson?: string;
};

export type CreateWorkflowPayload = {
  name: string;
  description?: string;
  scope: "personal" | "project";
  projectId?: string;
  status?: FlowDTO["status"];
  version?: number;
  definitionJson?: string;
};

export async function listFlows(): Promise<FlowDTO[]> {
  const res = await request<{ data: FlowDTO[] }>(`${API_BASE_URL}/flows`);
  return res.data;
}

export async function getFlow(id: string): Promise<FlowDTO & { definitionJson?: string }> {
  const res = await request<{ data: FlowDTO }>(`${API_BASE_URL}/flows/${id}`);
  return res.data;
}

export async function updateFlow(id: string, payload: UpdateFlowPayload): Promise<FlowDTO> {
  const res = await request<{ data: FlowDTO }>(`${API_BASE_URL}/flows/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function createFlow(payload: CreateFlowPayload): Promise<FlowDTO> {
  const res = await request<{ data: FlowDTO }>(`${API_BASE_URL}/flows`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function deleteFlow(id: string): Promise<{ id: string }> {
  const res = await request<{ data: { id: string } }>(`${API_BASE_URL}/flows/${id}`, {
    method: "DELETE",
  });
  return res.data;
}

export async function listPersonalWorkflows(): Promise<FlowDTO[]> {
  const res = await request<{ data: FlowDTO[] }>(`${API_BASE_URL}/flows?scope=personal`);
  return res.data;
}

export async function listProjectWorkflows(projectId: string): Promise<FlowDTO[]> {
  const url = `${API_BASE_URL}/flows?scope=project&projectId=${encodeURIComponent(projectId)}`;
  const res = await request<{ data: FlowDTO[] }>(url);
  return res.data;
}

export async function createWorkflow(payload: CreateWorkflowPayload): Promise<FlowDTO> {
  const res = await request<{ data: FlowDTO }>(`${API_BASE_URL}/flows`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.data;
}
