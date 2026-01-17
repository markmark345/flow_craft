import { API_BASE_URL } from "@/lib/env";
import { request } from "@/lib/fetcher";
import { FlowDTO } from "@/types/dto";

export type CreateWorkflowPayload = {
  name: string;
  description?: string;
  scope: "personal" | "project";
  projectId?: string;
  status?: FlowDTO["status"];
  version?: number;
  definitionJson?: string;
};

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

