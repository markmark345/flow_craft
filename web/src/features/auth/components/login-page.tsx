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
import { useLoginPage } from "../hooks/use-login-page";

export function LoginPage() {
  const {
    identifier,
    password,
    showPassword,
    inlineError,
    loading,
    next,
    inputErrorStyle,
    setIdentifier,
    setPassword,
    setShowPassword,
    onSubmit,
    startOAuth,
    showInfo,
  } = useLoginPage();

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
              <Label>Email or username</Label>
              <Input
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="name@company.com"
                autoComplete="username"
                className="h-11 rounded-lg bg-surface2"
                style={inputErrorStyle}
                aria-invalid={Boolean(inlineError)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label>Password</Label>
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
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  type={showPassword ? "text" : "password"}
                  className="h-11 rounded-lg bg-surface2 pr-11"
                  style={inputErrorStyle}
                  aria-invalid={Boolean(inlineError)}
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
        <Button variant="link" className="p-0 h-auto font-normal" onClick={() => showInfo("Privacy", "Coming soon.")}>
          Privacy
        </Button>
        <Link href="/docs" className="hover:text-text">
          Docs
        </Link>
        <Button variant="link" className="p-0 h-auto font-normal" onClick={() => showInfo("Support", "Coming soon.")}>
          Contact Support
        </Button>
      </div>
    </div>
  );
}
