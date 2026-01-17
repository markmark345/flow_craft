"use client";

import { useThemeSync } from "@/hooks/use-app-store";

export function ThemeWatcher() {
  useThemeSync();
  return null;
}
