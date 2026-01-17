import { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> & {
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export function Toggle({ checked, onChange, className, ...props }: Props) {
  return (
    <label className={cn("relative inline-flex items-center cursor-pointer", className)}>
      <input
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        {...props}
      />
      <div className="w-10 h-6 bg-surface2 border border-border rounded-full peer peer-checked:bg-accent relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-panel after:border after:border-border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-4" />
    </label>
  );
}
