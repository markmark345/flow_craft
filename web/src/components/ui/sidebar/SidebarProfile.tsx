
"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { useAppStore, useMounted } from "@/hooks/use-app-store";
import { useAuthStore } from "@/features/auth/store/use-auth-store";
import { useLogout } from "@/features/auth/hooks/use-logout";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";

export function SidebarProfile() {
  const router = useRouter();
  const mounted = useMounted();
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const isDark = mounted ? theme === "dark" : false;
  
  const authUser = useAuthStore((s) => s.user);
  const user = mounted ? authUser : undefined;
  
  const { signOut, loading: signingOut } = useLogout();

  const initials = (() => {
    const name = (user?.name || "").trim();
    if (name) {
      const parts = name.split(/\s+/).filter(Boolean);
      return ((parts[0]?.[0] || "") + (parts[1]?.[0] || parts[0]?.[1] || "")).toUpperCase() || "U";
    }
    const email = (user?.email || "").trim();
    if (email) return email.slice(0, 2).toUpperCase();
    return "U";
  })();

  return (
    <div className="flex flex-col gap-2 border-t border-border pt-4">
      <Link
        className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted hover:bg-surface2 hover:text-text transition-colors"
        href="/docs"
      >
        <Icon name="help" className="text-[20px]" />
        <span className="text-sm font-medium">Documentation</span>
      </Link>

      <button
        type="button"
        onClick={toggleTheme}
        className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-muted hover:bg-surface2 hover:text-text transition-colors"
        title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      >
        <span className="flex items-center gap-3">
          <Icon name={isDark ? "dark_mode" : "light_mode"} className="text-[20px]" />
          <span className="text-sm font-medium">Theme</span>
        </span>
        <span className="text-xs font-semibold px-2 py-1 rounded-md bg-surface2 border border-border text-muted">
          {isDark ? "Dark" : "Light"}
        </span>
      </button>

      <div className="flex items-center gap-3 px-3 py-2 mt-2">
        <div className="size-8 rounded-full bg-surface2 border border-border flex items-center justify-center text-xs font-bold text-muted">
          {initials}
        </div>
        <div className="flex flex-col overflow-hidden">
          <span className="text-sm font-medium truncate">{user?.name || user?.email || "User"}</span>
          <span className="text-xs text-muted truncate">{user?.email || ""}</span>
        </div>
        <button
          type="button"
          className="ml-auto inline-flex items-center justify-center size-9 rounded-lg border border-border bg-surface hover:bg-surface2 text-muted hover:text-text transition-colors disabled:opacity-60"
          title="Log out"
          onClick={async () => {
            await signOut();
            router.replace("/login");
          }}
          disabled={signingOut}
        >
          <Icon name="arrow_back" className="text-[18px] rotate-180" />
        </button>
      </div>
    </div>
  );
}
