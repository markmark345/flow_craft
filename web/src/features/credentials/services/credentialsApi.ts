import { API_BASE_URL } from "@/lib/env";
import { request } from "@/lib/fetcher";
import { CredentialDTO } from "@/types/dto";

export async function listCredentials(
  scope: "personal" | "project",
  projectId?: string
): Promise<CredentialDTO[]> {
  const params = new URLSearchParams();
  params.set("scope", scope);
  if (projectId) params.set("projectId", projectId);
  const res = await request<{ data: CredentialDTO[] }>(`${API_BASE_URL}/credentials?${params.toString()}`);
  return res.data;
}

export async function deleteCredential(id: string): Promise<{ id: string }> {
  const res = await request<{ data: { id: string } }>(`${API_BASE_URL}/credentials/${id}`, {
    method: "DELETE",
  });
  return res.data;
}

export async function startCredentialOAuth(
  provider: "google" | "github",
  payload: { scope: "personal" | "project"; projectId?: string; name?: string; returnTo?: string }
): Promise<{ url: string }> {
  const res = await request<{ data: { url: string } }>(`${API_BASE_URL}/credentials/oauth/${provider}/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.data;
}
