import { useEffect, useMemo, useRef, useState } from "react";
import { NODE_CATEGORIES } from "../types/node-catalog";
import type { BuilderNodeType } from "../types";
import { useBuilderStore } from "../store/use-builder-store";

export interface UseFlowNodeReturn {
  pickerRef: React.RefObject<HTMLDivElement | null>;
  pickerOpen: boolean;
  setPickerOpen: (value: boolean) => void;
  query: string;
  setQuery: (value: string) => void;
  pickerSourceHandle: string | undefined;
  setPickerSourceHandle: (value: string | undefined) => void;
  groups: typeof NODE_CATEGORIES;
  onQuickAdd: (nodeType: BuilderNodeType) => void;
}

/**
 * Custom hook for managing flow node state.
 * Handles quick add picker, node search, and connected node creation.
 */
export function useFlowNode(
  id: string,
  nodeType: string,
  selected: boolean
): UseFlowNodeReturn {
  const pickerRef = useRef<HTMLDivElement>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [pickerSourceHandle, setPickerSourceHandle] = useState<string | undefined>(undefined);
  const addConnectedNode = useBuilderStore((s) => s.addConnectedNode);

  // Close picker on outside click
  useEffect(() => {
    if (!pickerOpen) return;
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (!pickerRef.current?.contains(target)) setPickerOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [pickerOpen]);

  // Filter node categories by search query
  const groups = useMemo(() => {
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

  const onQuickAdd = (newNodeType: BuilderNodeType) => {
    const sourceHandle = pickerSourceHandle || (nodeType === "if" ? "true" : undefined);
    addConnectedNode(id, newNodeType, { sourceHandle });
    setPickerOpen(false);
    setQuery("");
  };

  // Close picker when node is deselected
  useEffect(() => {
    if (!selected) setPickerOpen(false);
  }, [selected]);

  return {
    pickerRef,
    pickerOpen,
    setPickerOpen,
    query,
    setQuery,
    pickerSourceHandle,
    setPickerSourceHandle,
    groups,
    onQuickAdd,
  };
}
