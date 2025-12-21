import { getAuthToken } from "./auth";

const DEFAULT_TIMEOUT = 10_000;

export type RequestOptions = RequestInit & { timeoutMs?: number };

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs || DEFAULT_TIMEOUT);

  const headers = new Headers(options.headers || undefined);
  const token = getAuthToken();
  if (token && !headers.has("Authorization")) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(path, { ...options, headers, signal: controller.signal });
  clearTimeout(timeout);

  if (!res.ok) {
    const message = await safeMessage(res);
    throw new Error(message || `Request failed: ${res.status}`);
  }
  return (await res.json()) as T;
}

async function safeMessage(res: Response) {
  try {
    const data = await res.json();
    // @ts-ignore
    return data?.error?.message || data?.message;
  } catch {
    return undefined;
  }
}
