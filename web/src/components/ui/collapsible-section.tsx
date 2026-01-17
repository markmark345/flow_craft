"use client";

import type { ReactNode } from "react";
import { useEffect, useId, useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/icon";

type Props = {
  title: ReactNode;
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  disabled?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  right?: ReactNode;
  icon?: ReactNode;
  durationMs?: number;
};

export function CollapsibleSection({
  title,
  children,
  open: openProp,
  defaultOpen = true,
  disabled = false,
  onOpenChange,
  className,
  headerClassName,
  contentClassName,
  right,
  icon,
  durationMs: durationMsProp,
}: Props) {
  const id = useId();
  const durationMs = useMemo(() => (typeof durationMsProp === "number" ? durationMsProp : 220), [durationMsProp]);
  const isControlled = typeof openProp === "boolean";
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const open = isControlled ? Boolean(openProp) : uncontrolledOpen;

  const [renderChildren, setRenderChildren] = useState(open);

  useEffect(() => {
    if (open) {
      setRenderChildren(true);
      return;
    }
    const t = window.setTimeout(() => setRenderChildren(false), durationMs);
    return () => window.clearTimeout(t);
  }, [durationMs, open]);

  const setOpen = (next: boolean) => {
    if (!isControlled) setUncontrolledOpen(next);
    onOpenChange?.(next);
  };

  return (
    <section className={cn("flex flex-col gap-2", className)} data-open={open ? "true" : "false"}>
      <button
        type="button"
        className={cn(
          "w-full flex items-center justify-between px-2 py-1 text-xs font-bold uppercase tracking-wider text-muted hover:text-text transition-colors",
          disabled ? "opacity-70 cursor-default hover:text-muted" : "",
          headerClassName
        )}
        aria-expanded={open}
        aria-controls={id}
        disabled={disabled}
        onClick={() => (disabled ? null : setOpen(!open))}
      >
        <span className="flex items-center gap-2 min-w-0">
          {icon ? <span className="shrink-0">{icon}</span> : null}
          <span className="truncate">{title}</span>
        </span>
        <span className="flex items-center gap-2 shrink-0">
          {right}
          <Icon
            name="expand_more"
            className={cn("text-[18px] transition-transform", open ? "" : "-rotate-90")}
          />
        </span>
      </button>

      <div
        id={id}
        className={cn(
          "grid overflow-hidden transition-[grid-template-rows,opacity] ease-in-out",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
        style={{ transitionDuration: `${durationMs}ms` }}
      >
        <div className="min-h-0 overflow-hidden">
          {renderChildren ? <div className={cn(contentClassName)}>{children}</div> : null}
        </div>
      </div>
    </section>
  );
}

