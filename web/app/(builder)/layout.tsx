import type { ReactNode } from "react";
import { ThemeWatcher } from "@/components/ui/theme-watcher";
import { ToastViewport } from "@/components/ui/toast-viewport";
import { AuthGate } from "@/features/auth/components/auth-gate";

export default function BuilderLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-bg text-text">
      <ThemeWatcher />
      <ToastViewport />
      <AuthGate />
      {children}
    </div>
  );
}
