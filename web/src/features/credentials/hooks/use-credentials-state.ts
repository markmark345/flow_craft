
import { useEffect, useRef, useState } from "react";

export function useCredentialsState() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const onMouseDown = (event: MouseEvent) => {
      const root = menuRef.current;
      if (!root) return;
      if (event.target instanceof Node && !root.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  const closeConfirmDelete = () => {
    setConfirmDeleteOpen(false);
    setSelectedId(null);
  };

  return {
    menuOpen,
    setMenuOpen,
    menuRef,
    confirmDeleteOpen,
    setConfirmDeleteOpen,
    selectedId,
    setSelectedId,
    deleting,
    setDeleting,
    closeConfirmDelete,
  };
}
