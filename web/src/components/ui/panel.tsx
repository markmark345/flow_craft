import { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("bg-surface border border-border rounded-md shadow-soft", className)}>
      {children}
    </div>
  );
}
