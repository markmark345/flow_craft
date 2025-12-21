import type { ReactNode } from "react";
import { ThemeWatcher } from "@/shared/components/theme-watcher";
import { ToastViewport } from "@/shared/components/toast-viewport";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-bg text-text">
      <ThemeWatcher />
      <ToastViewport />
      {children}
    </div>
  );
}

