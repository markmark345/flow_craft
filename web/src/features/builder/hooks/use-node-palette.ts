import { useEffect, useMemo, useState } from "react";
import { NODE_CATEGORIES } from "../types/node-catalog";
import { APP_CATALOG, listAppActions } from "../nodeCatalog/catalog";
import type { Viewport } from "../types";

const COLLAPSE_STORAGE_KEY = "flowcraft.palette.collapsed.v1";

export interface UseNodePaletteReturn {
  query: string;
  setQuery: (value: string) => void;
  collapsed: Record<string, boolean>;
  forceExpand: boolean;
  isCollapsed: (key: string) => boolean;
  setSectionOpen: (key: string, open: boolean) => void;
  canvasItems: Array<{
    type: "stickyNote";
    label: string;
    description: string;
    accent: string;
  }>;
  filtered: typeof NODE_CATEGORIES;
  appItems: Array<{
    appKey: string;
    label: string;
    description: string;
    icon?: string;
    searchable: string;
  }>;
  computeCenter: () => { x: number; y: number };
}

/**
 * Custom hook for managing node palette state and filtering.
 * Handles search, collapsed sections, localStorage persistence, and canvas center calculation.
 */
export function useNodePalette(viewport: Viewport | null): UseNodePaletteReturn {
  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const forceExpand = query.trim().length > 0;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(COLLAPSE_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") setCollapsed(parsed);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(COLLAPSE_STORAGE_KEY, JSON.stringify(collapsed));
    } catch {
      // ignore
    }
  }, [collapsed]);

  const isCollapsed = (key: string) => !forceExpand && Boolean(collapsed[key]);

  const setSectionOpen = (key: string, open: boolean) =>
    setCollapsed((prev) => ({ ...prev, [key]: !open }));

  const canvasItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    const items = [
      {
        type: "stickyNote" as const,
        label: "Sticky Note",
        description: "Add an annotation on the canvas",
        accent: "warning",
      },
    ];
    if (!q) return items;
    return items.filter((i) => `${i.label} ${i.description}`.toLowerCase().includes(q));
  }, [query]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return NODE_CATEGORIES;
    return NODE_CATEGORIES.map((cat) => ({
      ...cat,
      items: cat.items.filter((item) => {
        const label = item.label.toLowerCase();
        const desc = item.description.toLowerCase();
        return label.includes(q) || desc.includes(q);
      }),
    })).filter((cat) => cat.items.length > 0);
  }, [query]);

  const appItems = useMemo(() => {
    const items = Object.values(APP_CATALOG).map((app) => {
      const actionText = listAppActions(app.appKey)
        .map((a) => a.label)
        .join(" ");
      return {
        appKey: app.appKey,
        label: app.label,
        description: app.description,
        icon: app.icon,
        searchable: `${app.label} ${app.description} ${app.appKey} ${actionText}`.toLowerCase(),
      };
    });
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => i.searchable.includes(q));
  }, [query]);

  const computeCenter = () => {
    const zoom = viewport?.zoom || 1;
    const el = typeof document !== "undefined" ? document.querySelector<HTMLElement>(".fc-canvas") : null;
    if (!el) return { x: 0, y: 0 };
    const rect = el.getBoundingClientRect();
    const screenX = rect.width / 2;
    const screenY = rect.height / 2;
    return { x: (screenX - (viewport?.x || 0)) / zoom, y: (screenY - (viewport?.y || 0)) / zoom };
  };

  return {
    query,
    setQuery,
    collapsed,
    forceExpand,
    isCollapsed,
    setSectionOpen,
    canvasItems,
    filtered,
    appItems,
    computeCenter,
  };
}
