"use client";

import { Icon } from "@/components/ui/icon";
import { IconButton } from "@/components/ui/icon-button";
import { cn } from "@/lib/cn";
import { useAppStore, useMounted } from "@/hooks/use-app-store";

export function ThemeToggle({ className }: { className?: string }) {
  const mounted = useMounted();
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const isDark = mounted ? theme === "dark" : false;

  return (
    <IconButton
      icon={isDark ? "dark_mode" : "light_mode"}
      className={cn(
        "size-9 rounded-lg border border-border bg-surface text-muted hover:text-text hover:bg-surface2 transition-colors focus:outline-none focus:shadow-focus",
        className
      )}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={toggleTheme}
    />
  );
}
