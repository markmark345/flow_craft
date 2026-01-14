"use client";

import { BrandLogo } from "@/shared/components/BrandLogo";
import { Panel } from "@/shared/components/panel";
import { useOAuthCallbackPage } from "../hooks/use-oauth-callback-page";

export function OAuthCallbackPage() {
  const { status } = useOAuthCallbackPage();

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
