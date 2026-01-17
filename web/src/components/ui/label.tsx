import { cn } from "@/lib/cn";
import { ComponentProps } from "react";

export function Label({ className, ...props }: ComponentProps<"label">) {
  return (
    <label
      className={cn(
        "text-xs font-semibold text-muted uppercase tracking-wide",
        className
      )}
      {...props}
    />
  );
}
