import type { ReactNode } from "react";
import { ThemeWatcher } from "@/components/ui/theme-watcher";
import { ToastViewport } from "@/components/ui/toast-viewport";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-bg text-text">
      <ThemeWatcher />
      <ToastViewport />
      {children}
    </div>
  );
}

