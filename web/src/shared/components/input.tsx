import { InputHTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "h-10 w-full rounded-md bg-surface border border-border px-3 text-sm text-text placeholder:text-muted focus:outline-none focus:shadow-focus",
        className
      )}
    />
  );
}
