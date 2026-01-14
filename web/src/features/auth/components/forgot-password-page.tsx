"use client";

import Link from "next/link";
import type { Route } from "next";
import { BrandLogo } from "@/shared/components/BrandLogo";
import { Button } from "@/shared/components/button";
import { Input } from "@/shared/components/input";
import { Panel } from "@/shared/components/panel";
import { useForgotPasswordPage } from "../hooks/use-forgot-password-page";

export function ForgotPasswordPage() {
  const { email, loading, done, inlineError, next, inputErrorStyle, setEmail, onSubmit } = useForgotPasswordPage();

  return (
    <div className="min-h-screen grid-background flex flex-col items-center justify-center px-4 py-12">
      <Panel className="w-full max-w-[420px] bg-panel rounded-2xl shadow-lift border border-border">
        <div className="p-8">
          <div className="flex items-center justify-center mb-6">
            <BrandLogo />
          </div>

          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-text">Reset your password</h1>
            <p className="text-sm text-muted mt-1">We&apos;ll email you a secure reset link.</p>
          </div>

          {done ? (
            <div className="space-y-4 text-center">
              <div className="text-sm text-muted">
                If an account exists for <span className="text-text font-medium">{email.trim()}</span>, we sent a reset
                link. Check your inbox and spam folder.
              </div>
              <Link href={"/login" as Route} className="text-sm font-semibold text-accent hover:underline">
                Back to login
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted uppercase tracking-wide">Email</label>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  autoComplete="email"
                  className="h-11 rounded-lg bg-surface2"
                  aria-invalid={Boolean(inlineError)}
                  style={inputErrorStyle}
                />
              </div>

              {inlineError ? (
                <div className="text-sm" style={{ color: "var(--error)" }} role="alert">
                  {inlineError}
                </div>
              ) : null}

              <Button className="w-full h-11 rounded-lg font-semibold" onClick={onSubmit} disabled={loading}>
                {loading ? "Sending..." : "Send reset link"}
              </Button>

              <div className="pt-2 text-center text-sm text-muted">
                Remembered your password?{" "}
                <Link href={next as Route} className="text-accent font-semibold hover:underline">
                  Log in
                </Link>
              </div>
            </div>
          )}
        </div>
      </Panel>
    </div>
  );
}
