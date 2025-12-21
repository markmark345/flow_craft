import { API_BASE_URL } from "@/shared/lib/env";
import { request } from "@/shared/lib/fetcher";
import { FlowDTO } from "@/shared/types/dto";

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

export async function listFlows(): Promise<FlowDTO[]> {
  const res = await request<{ data: FlowDTO[] }>(`${API_BASE_URL}/flows`);
  return res.data;
}

export async function getFlow(id: string): Promise<FlowDTO & { definitionJson?: string }> {
  const res = await request<{ data: any }>(`${API_BASE_URL}/flows/${id}`);
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
