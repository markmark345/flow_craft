"use client";

import { ToastContainer } from "./toast";
import { useAppStore } from "@/hooks/use-app-store";

export function ToastViewport() {
  const toasts = useAppStore((s) => s.toasts);
  const removeToast = useAppStore((s) => s.removeToast);
  return <ToastContainer items={toasts} onClose={removeToast} />;
}
