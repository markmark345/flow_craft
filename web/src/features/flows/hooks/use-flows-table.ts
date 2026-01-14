import { useEffect, useState } from "react";

export interface UseFlowsTableReturn {
  menuOpenFor: string | null;
  setMenuOpenFor: (value: string | null | ((cur: string | null) => string | null)) => void;
}

/**
 * Custom hook for managing flows table state.
 * Handles row action menu dropdown and outside click behavior.
 */
export function useFlowsTable(): UseFlowsTableReturn {
  const [menuOpenFor, setMenuOpenFor] = useState<string | null>(null);

  useEffect(() => {
    if (!menuOpenFor) return;
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      const el = document.querySelector(`[data-flow-menu-root="${menuOpenFor}"]`);
      if (!el || !el.contains(target)) setMenuOpenFor(null);
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [menuOpenFor]);

  return {
    menuOpenFor,
    setMenuOpenFor,
  };
}
