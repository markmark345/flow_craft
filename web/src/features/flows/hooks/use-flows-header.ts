import { useEffect, useRef, useState } from "react";

export interface UseFlowsHeaderReturn {
  createMenuOpen: boolean;
  setCreateMenuOpen: (value: boolean | ((prev: boolean) => boolean)) => void;
  createMenuRef: React.RefObject<HTMLDivElement | null>;
  fileRef: React.RefObject<HTMLInputElement | null>;
  onImportClick: () => void;
  handleImportFile: (file: File) => Promise<void>;
}

/**
 * Custom hook for managing flows header state and interactions.
 * Handles create menu dropdown, file import input, and menu close behavior.
 */
export function useFlowsHeader(
  onImportFile: (file: File) => Promise<void> | void
): UseFlowsHeaderReturn {
  const [createMenuOpen, setCreateMenuOpen] = useState(false);
  const createMenuRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!createMenuOpen) return;
    const onMouseDown = (e: MouseEvent) => {
      const el = createMenuRef.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) setCreateMenuOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCreateMenuOpen(false);
    };
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [createMenuOpen]);

  const onImportClick = () => fileRef.current?.click();

  const handleImportFile = async (file: File) => {
    try {
      await onImportFile(file);
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return {
    createMenuOpen,
    setCreateMenuOpen,
    createMenuRef,
    fileRef,
    onImportClick,
    handleImportFile,
  };
}
