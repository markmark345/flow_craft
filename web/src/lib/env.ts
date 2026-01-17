export function getEnv(key: string): string | undefined;
export function getEnv(key: string, fallback: string): string;
export function getEnv(key: string, fallback?: string) {
  if (typeof process === "undefined") return fallback;
  return process.env[key] || fallback;
}

export const API_BASE_URL = getEnv("NEXT_PUBLIC_API_BASE_URL", "http://localhost:8080/api/v1");
