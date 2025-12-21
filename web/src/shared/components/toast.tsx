import { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import { Icon } from "@/shared/components/icon";

export type ToastItem = {
  id: string;
  title: string;
  description?: string;
  tone?: "info" | "success" | "error";
};

const toneMeta: Record<
  string,
  { ring: string; icon: string; iconBgClass: string; iconBg?: string; iconColor: string }
> = {
  info: {
    ring: "border-border",
    icon: "info",
    iconBgClass: "bg-surface2",
    iconColor: "text-accent",
  },
  success: {
    ring: "border-border",
    icon: "check_circle",
    iconBg: "var(--success)",
    iconBgClass: "",
    iconColor: "text-green",
  },
  error: {
    ring: "border-border",
    icon: "error",
    iconBg: "var(--error)",
    iconBgClass: "",
    iconColor: "text-red",
  },
};

export function Toast({ item, onClose }: { item: ToastItem; onClose?: () => void }) {
  const tone = item.tone || "info";
  const meta = toneMeta[tone] || toneMeta.info;
  return (
    <div
      className={cn(
        "pointer-events-auto transform translate-y-0 opacity-100 transition-all duration-300 ease-out",
        "bg-panel border rounded-lg shadow-lift p-4 flex items-start gap-3",
        meta.ring
      )}
    >
      <div
        className={cn("p-1.5 rounded-full shrink-0", meta.iconBgClass, meta.iconColor)}
        style={
          meta.iconBg ? { background: `color-mix(in srgb, ${meta.iconBg} 14%, transparent)` } : undefined
        }
      >
        <Icon name={meta.icon} className="text-[16px]" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-text">{item.title}</div>
        {item.description ? <div className="text-xs text-muted mt-0.5">{item.description}</div> : null}
      </div>
      {onClose ? (
        <button
          type="button"
          className="text-muted hover:text-text transition-colors p-1 rounded-md hover:bg-surface2"
          onClick={onClose}
          aria-label="Dismiss"
        >
          <Icon name="close" className="text-[16px]" />
        </button>
      ) : null}
    </div>
  );
}

export function ToastContainer({
  items,
  onClose,
}: {
  items: ToastItem[];
  onClose?: (id: string) => void;
}) {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none w-full max-w-sm">
      {items.map((item) => (
        <Toast key={item.id} item={item} onClose={onClose ? () => onClose(item.id) : undefined} />
      ))}
    </div>
  );
}
