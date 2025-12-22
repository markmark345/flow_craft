import { API_BASE_URL } from "@/shared/lib/env";
import { request } from "@/shared/lib/fetcher";
import { RunDTO, RunStepDTO } from "@/shared/types/dto";

export async function listRuns(opts?: { scope?: "personal" | "project"; projectId?: string | null }): Promise<RunDTO[]> {
  const params = new URLSearchParams();
  if (opts?.scope) {
    params.set("scope", opts.scope);
    if (opts.scope === "project" && opts.projectId) {
      params.set("projectId", opts.projectId);
    }
  }
  const suffix = params.toString();
  const url = suffix ? `${API_BASE_URL}/runs?${suffix}` : `${API_BASE_URL}/runs`;
  const res = await request<{ data: RunDTO[] }>(url);
  return res.data;
}

export async function getRun(id: string): Promise<RunDTO> {
  const res = await request<{ data: RunDTO }>(`${API_BASE_URL}/runs/${id}`);
  return res.data;
}

export async function runFlow(flowId: string): Promise<RunDTO> {
  const res = await request<{ data: RunDTO }>(`${API_BASE_URL}/flows/${flowId}/run`, {
    method: "POST",
  });
  return res.data;
}

export async function cancelRun(runId: string): Promise<RunDTO> {
  const res = await request<{ data: RunDTO }>(`${API_BASE_URL}/runs/${runId}/cancel`, {
    method: "POST",
  });
  return res.data;
}

export async function listRunSteps(runId: string): Promise<RunStepDTO[]> {
  const res = await request<{ data: RunStepDTO[] }>(`${API_BASE_URL}/runs/${runId}/steps`);
  return res.data;
}

export async function getRunStep(runId: string, stepId: string): Promise<RunStepDTO> {
  const res = await request<{ data: RunStepDTO }>(`${API_BASE_URL}/runs/${runId}/steps/${stepId}`);
  return res.data;
}
