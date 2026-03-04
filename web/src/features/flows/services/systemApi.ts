import { API_BASE_URL } from "@/lib/env";
import { request } from "@/lib/fetcher";

/** resetWorkspace — calls POST /system/reset to wipe all workspace data. */
export async function resetWorkspace(): Promise<void> {
  await request(`${API_BASE_URL}/system/reset`, { method: "POST" });
}
