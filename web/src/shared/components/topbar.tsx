"use client";

import Link from "next/link";
import { BrandLogo } from "./BrandLogo";
import { Button } from "./button";
import { useAppStore } from "@/shared/hooks/use-app-store";

export function Topbar() {
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);

  return (
    <header className="h-14 px-4 border-b border-border bg-panel flex items-center justify-between fc-topbar-highlight">
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex">
          <BrandLogo showTagline />
        </div>
        <div className="flex sm:hidden">
          <BrandLogo compact />
        </div>
      </div>
      <div className="flex items-center gap-3 text-sm text-muted">
        <Link href="/settings">Settings</Link>
        <Button variant="secondary" size="sm" onClick={toggleTheme}>
          {theme === "light" ? "Dark mode" : "Light mode"}
        </Button>
        <div className="w-8 h-8 rounded-full bg-surface border border-border" />
      </div>
    </header>
  );
}
