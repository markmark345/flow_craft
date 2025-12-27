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

import { resetPassword } from "../services/authApi";

export function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const showSuccess = useAppStore((s) => s.showSuccess);
  const showError = useAppStore((s) => s.showError);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const onSubmit = async () => {
    setInlineError(null);
    if (!token) {
      setInlineError("Reset token is missing.");
      return;
    }
    if (!password) {
      setInlineError("Password is required.");
      return;
    }
    if (password !== confirm) {
      setInlineError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await resetPassword(token, password);
      setDone(true);
      showSuccess("Password updated", "You can now log in with your new password.");
      setTimeout(() => router.replace("/login"), 800);
    } catch (err: any) {
      showError("Reset failed", err?.message || "Unable to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid-background flex flex-col items-center justify-center px-4 py-12">
      <Panel className="w-full max-w-[420px] bg-panel rounded-2xl shadow-lift border border-border">
        <div className="p-8">
          <div className="flex items-center justify-center mb-6">
            <BrandLogo />
          </div>

          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-text">Choose a new password</h1>
            <p className="text-sm text-muted mt-1">Use a strong password you haven&apos;t used before.</p>
          </div>

          {done ? (
            <div className="space-y-4 text-center">
              <div className="text-sm text-muted">Password updated successfully.</div>
              <Link href={"/login" as Route} className="text-sm font-semibold text-accent hover:underline">
                Continue to login
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted uppercase tracking-wide">New password</label>
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
                    aria-invalid={Boolean(inlineError)}
                    style={inlineError ? ({ borderColor: "var(--error)" } as const) : undefined}
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

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted uppercase tracking-wide">Confirm password</label>
                <Input
                  value={confirm}
                  onChange={(e) => {
                    setConfirm(e.target.value);
                    if (inlineError) setInlineError(null);
                  }}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  type={showPassword ? "text" : "password"}
                  className="h-11 rounded-lg bg-surface2"
                />
              </div>

              {inlineError ? (
                <div className="text-sm" style={{ color: "var(--error)" }} role="alert">
                  {inlineError}
                </div>
              ) : null}

              <Button className="w-full h-11 rounded-lg font-semibold" onClick={onSubmit} disabled={loading}>
                {loading ? "Updating..." : "Update password"}
              </Button>
            </div>
          )}
        </div>
      </Panel>
    </div>
  );
}
