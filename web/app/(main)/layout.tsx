import type { ReactNode } from "react";
import { AppShell } from "@/components/ui/app-shell";
import { AuthGate } from "@/features/auth/components/auth-gate";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell>
      <AuthGate />
      {children}
    </AppShell>
  );
}
