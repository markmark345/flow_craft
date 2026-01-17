"use client";

import Link from "next/link";
import type { Route } from "next";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { IconButton } from "@/components/ui/icon-button";
import { Input } from "@/components/ui/input";
import { Panel } from "@/components/ui/panel";
import { Label } from "@/components/ui/label";
import { useResetPasswordPage } from "../hooks/use-reset-password-page";

export function ResetPasswordPage() {
  const {
    password,
    confirm,
    showPassword,
    loading,
    done,
    inlineError,
    inputErrorStyle,
    setPassword,
    setConfirm,
    setShowPassword,
    onSubmit,
  } = useResetPasswordPage();

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
                <Label>New password</Label>
                <div className="relative">
                  <Input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    type={showPassword ? "text" : "password"}
                    className="h-11 rounded-lg bg-surface2 pr-11"
                    aria-invalid={Boolean(inlineError)}
                    style={inputErrorStyle}
                  />
                  <IconButton
                    icon={showPassword ? "visibility_off" : "visibility"}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    size="sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Confirm password</Label>
                <Input
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
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
