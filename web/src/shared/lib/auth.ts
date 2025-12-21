export type AuthUser = {
  id: string;
  name: string;
  email: string;
};

export type AuthSession = {
  token: string;
  user: AuthUser;
};

export const AUTH_STORAGE_KEY = "flowcraft.auth.v1";

export function readAuthSession(): Partial<AuthSession> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Partial<AuthSession>;
    if (!parsed || typeof parsed !== "object") return {};
    return parsed;
  } catch {
    return {};
  }
}

export function writeAuthSession(session: AuthSession | null) {
  if (typeof window === "undefined") return;
  try {
    if (!session) window.localStorage.removeItem(AUTH_STORAGE_KEY);
    else window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  } catch {
    // ignore
  }
}

export function getAuthToken(): string | undefined {
  const token = readAuthSession().token;
  return typeof token === "string" && token.trim() ? token : undefined;
}

