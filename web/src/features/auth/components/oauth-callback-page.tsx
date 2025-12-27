"use client";

import { useEffect, useState } from "react";
import type { Route } from "next";
import { useRouter, useSearchParams } from "next/navigation";

import { BrandLogo } from "@/shared/components/BrandLogo";
import { Panel } from "@/shared/components/panel";
import { useAppStore } from "@/shared/hooks/use-app-store";
import { useAuthStore } from "../store/use-auth-store";
import { request } from "@/shared/lib/fetcher";
import { API_BASE_URL } from "@/shared/lib/env";

export function OAuthCallbackPage() {
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

  return (
    <div className="min-h-screen grid-background flex flex-col items-center justify-center px-4 py-12">
      <Panel className="w-full max-w-[420px] bg-panel rounded-2xl shadow-lift border border-border">
        <div className="p-8 text-center space-y-3">
          <div className="flex items-center justify-center">
            <BrandLogo />
          </div>
          <div className="text-lg font-semibold text-text">Signing you in</div>
          <div className="text-sm text-muted">{status}</div>
        </div>
      </Panel>
    </div>
  );
}
