
import { useEffect, useLayoutEffect, useState } from "react";

export type DropdownPos = {
  left: number;
  width: number;
  top?: number;
  bottom?: number;
  maxHeight: number;
};

export function useSelectPosition(
  open: boolean,
  triggerRef: React.RefObject<HTMLButtonElement | null>
) {
  const [dropdownPos, setDropdownPos] = useState<DropdownPos | null>(null);

  const updateDropdownPosition = () => {
    if (typeof window === "undefined") return;
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const margin = 8;
    const maxWidth = Math.max(0, window.innerWidth - margin * 2);
    const width = Math.min(Math.max(rect.width, 220), maxWidth);

    let left = rect.left;
    left = Math.max(margin, Math.min(left, window.innerWidth - margin - width));

    const spaceBelow = window.innerHeight - rect.bottom - margin;
    const spaceAbove = rect.top - margin;
    const shouldOpenUp = spaceBelow < 240 && spaceAbove > spaceBelow;

    if (shouldOpenUp) {
      setDropdownPos({
        left,
        width,
        bottom: window.innerHeight - rect.top + margin,
        maxHeight: Math.max(160, rect.top - margin * 2),
      });
      return;
    }

    const top = rect.bottom + margin;
    setDropdownPos({
      left,
      width,
      top,
      maxHeight: Math.max(160, window.innerHeight - top - margin),
    });
  };

  useEffect(() => {
    if (!open) {
      setDropdownPos(null);
    }
  }, [open]);

  useLayoutEffect(() => {
    if (!open) return;
    updateDropdownPosition();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onViewportChange = () => updateDropdownPosition();
    window.addEventListener("resize", onViewportChange);
    window.addEventListener("scroll", onViewportChange, true);
    return () => {
      window.removeEventListener("resize", onViewportChange);
      window.removeEventListener("scroll", onViewportChange, true);
    };
  }, [open]);

  return dropdownPos;
}
