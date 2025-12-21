import { ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { ThemeWatcher } from "./theme-watcher";
import { ToastViewport } from "./toast-viewport";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-bg text-text">
      <ThemeWatcher />
      <ToastViewport />
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 min-w-0 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
