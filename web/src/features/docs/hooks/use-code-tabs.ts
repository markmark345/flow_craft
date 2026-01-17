import { useEffect, useMemo, useState } from "react";
import { useAppStore } from "@/hooks/use-app-store";
import type { CodeTab } from "../components/code-tabs";

export interface UseCodeTabsReturn {
  activeId: string | undefined;
  active: CodeTab | undefined;
  setActiveId: (id: string) => void;
  copyCode: () => Promise<void>;
}

/**
 * Custom hook for managing code tabs state and copy functionality.
 */
export function useCodeTabs(tabs: CodeTab[], initialTabId?: string): UseCodeTabsReturn {
  const showSuccess = useAppStore((s) => s.showSuccess);
  const showError = useAppStore((s) => s.showError);

  const defaultTabId = useMemo(() => initialTabId ?? tabs[0]?.id, [initialTabId, tabs]);
  const [activeId, setActiveId] = useState<string | undefined>(defaultTabId);

  useEffect(() => setActiveId(defaultTabId), [defaultTabId]);

  const active = useMemo(() => tabs.find((t) => t.id === activeId) ?? tabs[0], [activeId, tabs]);

  const copyCode = async () => {
    if (!active) return;
    try {
      await navigator.clipboard.writeText(active.code);
      showSuccess("Copied", "Code copied to clipboard.");
    } catch (err: any) {
      showError("Copy failed", err?.message || "Unable to copy");
    }
  };

  return {
    activeId,
    active,
    setActiveId,
    copyCode,
  };
}
