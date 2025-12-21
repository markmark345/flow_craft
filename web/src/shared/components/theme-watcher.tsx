"use client";

import { useThemeSync } from "@/shared/hooks/use-app-store";

export function ThemeWatcher() {
  useThemeSync();
  return null;
}
