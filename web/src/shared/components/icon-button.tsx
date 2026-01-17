import { ButtonHTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";
import { Icon } from "@/shared/components/icon";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: string;
  variant?: Variant;
  size?: Size;
};

const variantStyles: Record<Variant, string> = {
  primary: "bg-accent text-white hover:bg-accentStrong shadow-sm",
  secondary: "bg-surface border border-border text-text hover:bg-surface2 shadow-sm",
  ghost: "text-muted hover:bg-surface2 hover:text-text",
  danger: "bg-red text-white hover:shadow-glowError",
};

const sizeStyles: Record<Size, string> = {
  sm: "h-8 w-8 text-[16px]",
  md: "h-9 w-9 text-[18px]",
  lg: "h-10 w-10 text-[20px]",
};

export function IconButton({ className, variant = "ghost", size = "md", icon, ...props }: Props) {
  return (
    <button
      type="button"
      {...props}
      className={cn(
        "inline-flex items-center justify-center rounded-md transition focus:outline-none focus:shadow-focus disabled:opacity-60",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      <Icon name={icon} className="text-current text-[1em]" />
    </button>
  );
}
