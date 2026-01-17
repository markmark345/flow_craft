import { API_BASE_URL } from "@/lib/env";
import { request } from "@/lib/fetcher";
import { VariableDTO } from "@/types/dto";

export async function listVariables(
  scope: "personal" | "project",
  projectId?: string
): Promise<VariableDTO[]> {
  const params = new URLSearchParams();
  params.set("scope", scope);
  if (projectId) params.set("projectId", projectId);
  const res = await request<{ data: VariableDTO[] }>(`${API_BASE_URL}/variables?${params.toString()}`);
  return res.data;
}

export async function createVariable(payload: {
  scope: "personal" | "project";
  projectId?: string;
  key: string;
  value: string;
}): Promise<VariableDTO> {
  const res = await request<{ data: VariableDTO }>(`${API_BASE_URL}/variables`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function updateVariable(
  id: string,
  payload: { key?: string; value?: string }
): Promise<VariableDTO> {
  const res = await request<{ data: VariableDTO }>(`${API_BASE_URL}/variables/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function deleteVariable(id: string): Promise<{ id: string }> {
  const res = await request<{ data: { id: string } }>(`${API_BASE_URL}/variables/${id}`, {
    method: "DELETE",
  });
  return res.data;
}
