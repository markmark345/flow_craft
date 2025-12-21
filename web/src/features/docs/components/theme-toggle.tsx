"use client";

import { Icon } from "@/shared/components/icon";
import { cn } from "@/shared/lib/cn";
import { useAppStore, useMounted } from "@/shared/hooks/use-app-store";

export function ThemeToggle({ className }: { className?: string }) {
  const mounted = useMounted();
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const isDark = mounted ? theme === "dark" : false;

  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center size-9 rounded-lg border border-border bg-surface text-muted hover:text-text hover:bg-surface2 transition-colors focus:outline-none focus:shadow-focus",
        className
      )}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={toggleTheme}
    >
      <Icon name={isDark ? "dark_mode" : "light_mode"} className="text-[18px]" />
    </button>
  );
}
