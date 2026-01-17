import { useEffect, useState } from "react";
import type { Route } from "next";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppStore } from "@/hooks/use-app-store";
import { useAuthStore } from "../store/use-auth-store";
import { request } from "@/lib/fetcher";
import { API_BASE_URL } from "@/lib/env";

export interface UseOAuthCallbackPageReturn {
  // State
  status: string;
}

/**
 * Custom hook for managing OAuth Callback Page state and logic.
 * Handles OAuth token exchange and user session setup.
 */
export function useOAuthCallbackPage(): UseOAuthCallbackPageReturn {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const nextParam = searchParams.get("next") || "/";
  const setSession = useAuthStore((s) => s.setSession);
  const showError = useAppStore((s) => s.showError);
  const showSuccess = useAppStore((s) => s.showSuccess);
  const [status, setStatus] = useState("Finishing sign-in...");

  const normalizeNext = (value: string) => {
    if (!value.startsWith("/")) return "/";
    if (value.startsWith("//")) return "/";
    return value;
  };

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!token) {
        showError("Login failed", "Missing session token.");
        router.replace("/login" as Route);
        return;
      }
      try {
        setStatus("Loading your account...");
        const res = await request<{ data: { id: string; name: string; email: string } }>(`${API_BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (cancelled) return;
        setSession({ token, user: res.data });
        showSuccess("Welcome", res.data.email);
        router.replace(normalizeNext(nextParam) as Route);
      } catch (err: any) {
        if (cancelled) return;
        showError("Login failed", err?.message || "Unable to complete sign-in");
        router.replace("/login" as Route);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [nextParam, router, setSession, showError, showSuccess, token]);

  return {
    // State
    status,
  };
}
