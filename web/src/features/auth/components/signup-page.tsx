"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { useRouter, useSearchParams } from "next/navigation";

import { BrandLogo } from "@/shared/components/BrandLogo";
import { Button } from "@/shared/components/button";
import { Icon } from "@/shared/components/icon";
import { Input } from "@/shared/components/input";
import { Panel } from "@/shared/components/panel";
import { useAppStore } from "@/shared/hooks/use-app-store";

import { useSignup } from "../hooks/use-signup";

function inferUsername(email: string) {
  const trimmed = email.trim().toLowerCase();
  const at = trimmed.indexOf("@");
  if (at <= 0) return "";
  return trimmed.slice(0, at);
}

export function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";

  const { signUp, loading } = useSignup();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const usernameSuggestion = useMemo(() => inferUsername(email), [email]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);

  const inputErrorStyle = inlineError ? ({ borderColor: "var(--error)" } as const) : undefined;

  const toInlineMessage = (err: any) => {
    const raw = String(err?.message || "").trim();
    if (!raw) return "Sign up failed.";
    if (raw.toLowerCase().includes("already")) return "This email/username is already in use.";
    return raw;
  };

  const onSubmit = async () => {
    setInlineError(null);
    const e = email.trim();
    const u = (username.trim() || usernameSuggestion).trim();
    if (!e || !password) {
      setInlineError("Email and password are required.");
      return;
    }
    if (!u) {
      setInlineError("Username is required.");
      return;
    }

    try {
      await signUp({ name: name.trim(), email: e, username: u, password });
      router.replace(next as Route);
    } catch (err: any) {
      setInlineError(toInlineMessage(err));
    }
  };

  return (
    <div className="min-h-screen grid-background flex flex-col items-center justify-center px-4 py-12">
      <Panel className="w-full max-w-[460px] bg-panel rounded-2xl shadow-lift border border-border">
        <div className="p-8">
          <div className="flex items-center justify-center mb-6">
            <BrandLogo />
          </div>

          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-text">Create your account</h1>
            <p className="text-sm text-muted mt-1">Start building workflows in minutes.</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted uppercase tracking-wide">Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                autoComplete="name"
                className="h-11 rounded-lg bg-surface2"
                style={inputErrorStyle}
                aria-invalid={Boolean(inlineError)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted uppercase tracking-wide">Email</label>
              <Input
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (inlineError) setInlineError(null);
                }}
                placeholder="name@company.com"
                autoComplete="email"
                className="h-11 rounded-lg bg-surface2"
                style={inputErrorStyle}
                aria-invalid={Boolean(inlineError)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted uppercase tracking-wide">Username</label>
              <Input
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (inlineError) setInlineError(null);
                }}
                placeholder={usernameSuggestion || "username"}
                autoComplete="username"
                className="h-11 rounded-lg bg-surface2"
                style={inputErrorStyle}
                aria-invalid={Boolean(inlineError)}
              />
              {usernameSuggestion ? (
                <div className="text-xs text-muted">
                  Suggested: <span className="text-text font-medium">{usernameSuggestion}</span>
                </div>
              ) : null}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted uppercase tracking-wide">Password</label>
              <div className="relative">
                <Input
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (inlineError) setInlineError(null);
                  }}
                  placeholder="••••••••"
                  autoComplete="new-password"
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
              <div className="text-sm" style={{ color: "var(--error)" }} role="alert">
                {inlineError}
              </div>
            ) : null}

            <Button className="w-full h-11 rounded-lg font-semibold" onClick={onSubmit} disabled={loading}>
              {loading ? "Creating..." : "Sign Up"}
            </Button>

            <div className="pt-2 text-center text-sm text-muted">
              Already have an account?{" "}
              <Link href={`/login?next=${encodeURIComponent(next)}` as Route} className="text-accent font-semibold hover:underline">
                Log in
              </Link>
            </div>
          </div>
        </div>
      </Panel>
    </div>
  );
}
