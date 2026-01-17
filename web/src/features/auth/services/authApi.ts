import { API_BASE_URL } from "@/lib/env";
import { request } from "@/lib/fetcher";
import { AuthSession, AuthUser } from "@/lib/auth";

export async function login(identifier: string, password: string): Promise<AuthSession> {
  const res = await request<{ data: AuthSession }>(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier, password }),
  });
  return res.data;
}

export async function signup(input: {
  name: string;
  email: string;
  username: string;
  password: string;
}): Promise<AuthSession> {
  const res = await request<{ data: AuthSession }>(`${API_BASE_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return res.data;
}

export async function me(): Promise<AuthUser> {
  const res = await request<{ data: AuthUser }>(`${API_BASE_URL}/auth/me`, { method: "GET" });
  return res.data;
}

export async function logout(): Promise<{ ok: boolean }> {
  const res = await request<{ data: { ok: boolean } }>(`${API_BASE_URL}/auth/logout`, { method: "POST" });
  return res.data;
}

export async function requestPasswordReset(email: string, lang?: string): Promise<{ ok: boolean }> {
  const res = await request<{ data: { ok: boolean } }>(`${API_BASE_URL}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, lang }),
  });
  return res.data;
}

export async function resetPassword(token: string, newPassword: string): Promise<{ ok: boolean }> {
  const res = await request<{ data: { ok: boolean } }>(`${API_BASE_URL}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, newPassword }),
  });
  return res.data;
}
