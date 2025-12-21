import { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

type Tab = { id: string; label: string };

type Props = {
  tabs: Tab[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
};

export function Tabs({ tabs, activeId, onChange, className }: Props) {
  return (
    <div className={cn("flex border-b border-border", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "px-3 h-10 text-sm border-b-2",
            activeId === tab.id
              ? "border-accent text-text"
              : "border-transparent text-muted hover:text-text"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
