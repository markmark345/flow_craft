import { forwardRef, InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        {...props}
        className={cn(
          "h-10 w-full rounded-md bg-surface border border-border px-3 text-sm text-text placeholder:text-muted focus:outline-none focus:shadow-focus",
          className
        )}
      />
    );
  }
);

Input.displayName = "Input";
