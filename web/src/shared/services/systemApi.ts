import { API_BASE_URL } from "@/shared/lib/env";
import { request } from "@/shared/lib/fetcher";

export async function resetWorkspace(): Promise<void> {
  await request(`${API_BASE_URL}/system/reset`, { method: "POST" });
}

