import { API_BASE_URL } from "@/shared/lib/env";
import { request } from "@/shared/lib/fetcher";
import { ProjectDTO, ProjectMemberDTO } from "@/shared/types/dto";

type CreateProjectPayload = {
  name: string;
  description?: string;
};

type UpdateProjectPayload = {
  name?: string;
  description?: string;
};

type AddProjectMemberPayload = {
  identifier: string;
  role?: "admin" | "member";
};

export async function listProjects(): Promise<ProjectDTO[]> {
  const res = await request<{ data: ProjectDTO[] }>(`${API_BASE_URL}/projects`);
  return res.data;
}

export async function createProject(payload: CreateProjectPayload): Promise<ProjectDTO> {
  const res = await request<{ data: ProjectDTO }>(`${API_BASE_URL}/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function getProject(projectId: string): Promise<ProjectDTO> {
  const res = await request<{ data: ProjectDTO }>(`${API_BASE_URL}/projects/${projectId}`);
  return res.data;
}

export async function updateProject(projectId: string, payload: UpdateProjectPayload): Promise<ProjectDTO> {
  const res = await request<{ data: ProjectDTO }>(`${API_BASE_URL}/projects/${projectId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function deleteProject(projectId: string): Promise<{ id: string }> {
  const res = await request<{ data: { id: string } }>(`${API_BASE_URL}/projects/${projectId}`, {
    method: "DELETE",
  });
  return res.data;
}

export async function listProjectMembers(projectId: string): Promise<ProjectMemberDTO[]> {
  const res = await request<{ data: ProjectMemberDTO[] }>(`${API_BASE_URL}/projects/${projectId}/members`);
  return res.data;
}

export async function addProjectMember(projectId: string, payload: AddProjectMemberPayload): Promise<void> {
  await request(`${API_BASE_URL}/projects/${projectId}/members`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function removeProjectMember(projectId: string, userId: string): Promise<void> {
  await request(`${API_BASE_URL}/projects/${projectId}/members/${userId}`, { method: "DELETE" });
}

