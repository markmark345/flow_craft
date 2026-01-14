import { useEffect } from "react";

export interface UseCreateProjectModalReturn {
  disabled: boolean;
}

/**
 * Custom hook for managing create project modal behavior.
 * Handles escape key to close and form validation.
 */
export function useCreateProjectModal(
  open: boolean,
  name: string,
  creating: boolean,
  onClose: () => void
): UseCreateProjectModalReturn {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const disabled = creating || !name.trim();

  return {
    disabled,
  };
}
