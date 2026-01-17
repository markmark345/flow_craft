import { ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { ThemeWatcher } from "./theme-watcher";
import { ToastViewport } from "./toast-viewport";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="h-screen bg-bg text-text overflow-hidden">
      <ThemeWatcher />
      <ToastViewport />
      <div className="flex h-full min-h-0">
        <Sidebar />
        <main className="flex-1 min-w-0 min-h-0 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
