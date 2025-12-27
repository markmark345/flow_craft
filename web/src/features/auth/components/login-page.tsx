"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { useRouter, useSearchParams } from "next/navigation";

import { BrandLogo } from "@/shared/components/BrandLogo";
import { Button } from "@/shared/components/button";
import { Icon } from "@/shared/components/icon";
import { Input } from "@/shared/components/input";
import { Panel } from "@/shared/components/panel";
import { useAppStore } from "@/shared/hooks/use-app-store";
import { API_BASE_URL } from "@/shared/lib/env";

import { useLogin } from "../hooks/use-login";

export function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";

  const { signIn, loading } = useLogin();
  const showInfo = useAppStore((s) => s.showInfo);

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);

  const inputErrorStyle = inlineError ? ({ borderColor: "var(--error)" } as const) : undefined;

  const toInlineMessage = (err: any) => {
    const raw = String(err?.message || "").trim();
    if (!raw) return "Login failed.";
    if (raw.toLowerCase().includes("invalid")) return "Email/username or password is incorrect.";
    return raw;
  };

  const onSubmit = async () => {
    setInlineError(null);
    const id = identifier.trim();
    if (!id || !password) {
      setInlineError("Email/username and password are required.");
      return;
    }
    try {
      await signIn(id, password);
      router.replace(next as Route);
    } catch (err: any) {
      setInlineError(toInlineMessage(err));
    }
  };

  const startOAuth = (provider: "google" | "github") => {
    const target = `${API_BASE_URL}/auth/oauth/${provider}/start?next=${encodeURIComponent(next)}`;
    window.location.href = target;
  };

  return (
    <div className="min-h-screen grid-background flex flex-col items-center justify-center px-4 py-12">
      <Panel className="w-full max-w-[420px] bg-panel rounded-2xl shadow-lift border border-border">
        <div className="p-8">
          <div className="flex items-center justify-center mb-6">
            <BrandLogo />
          </div>

          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-text">Welcome back</h1>
            <p className="text-sm text-muted mt-1">Enter your credentials to access the workspace.</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted uppercase tracking-wide">Email or username</label>
              <Input
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  if (inlineError) setInlineError(null);
                }}
                placeholder="name@company.com"
                autoComplete="username"
                className="h-11 rounded-lg bg-surface2"
                style={inputErrorStyle}
                aria-invalid={Boolean(inlineError)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <label className="text-xs font-semibold text-muted uppercase tracking-wide">Password</label>
                <Link
                  href={`/forgot-password?next=${encodeURIComponent(next)}` as Route}
                  className="text-xs font-medium text-accent hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="relative">
                <Input
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (inlineError) setInlineError(null);
                  }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  type={showPassword ? "text" : "password"}
                  className="h-11 rounded-lg bg-surface2 pr-11"
                  style={inputErrorStyle}
                  aria-invalid={Boolean(inlineError)}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <Icon name={showPassword ? "visibility_off" : "visibility"} className="text-[18px]" />
                </button>
              </div>
            </div>

            {inlineError ? (
              <div
                className="text-sm"
                style={{ color: "var(--error)" }}
                role="alert"
              >
                {inlineError}
              </div>
            ) : null}

            <Button
              className="w-full h-11 rounded-lg font-semibold"
              onClick={onSubmit}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Log In"}
            </Button>

            <div className="flex items-center gap-3 py-2">
              <div className="h-px bg-border flex-1" />
              <div className="text-xs text-muted font-medium">OR</div>
              <div className="h-px bg-border flex-1" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="secondary"
                className="h-11 rounded-lg"
                onClick={() => startOAuth("github")}
              >
                <Icon name="github" className="text-[18px] mr-2" />
                GitHub
              </Button>
              <Button
                variant="secondary"
                className="h-11 rounded-lg"
                onClick={() => startOAuth("google")}
              >
                <Icon name="google" className="text-[18px] mr-2" />
                Google
              </Button>
            </div>

            <div className="pt-4 text-center text-sm text-muted">
              Don&apos;t have an account?{" "}
              <Link href={`/signup?next=${encodeURIComponent(next)}` as Route} className="text-accent font-semibold hover:underline">
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </Panel>

      <div className="mt-8 flex items-center gap-6 text-xs text-muted">
        <button type="button" className="hover:text-text" onClick={() => showInfo("Privacy", "Coming soon.")}>
          Privacy
        </button>
        <Link href="/docs" className="hover:text-text">
          Docs
        </Link>
        <button type="button" className="hover:text-text" onClick={() => showInfo("Support", "Coming soon.")}>
          Contact Support
        </button>
      </div>
    </div>
  );
}
