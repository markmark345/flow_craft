import { ButtonHTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size };

const variantStyles: Record<Variant, string> = {
  primary: "bg-accent text-white hover:bg-accentStrong shadow-sm",
  secondary: "bg-surface border border-border text-text hover:bg-surface2 shadow-sm",
  ghost: "text-text hover:bg-surface2",
  danger: "bg-red text-white hover:shadow-glowError",
};

const sizeStyles: Record<Size, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
};

export function Button({ className, variant = "primary", size = "md", ...props }: Props) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium leading-none transition focus:outline-none focus:shadow-focus disabled:opacity-60",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    />
  );
}
