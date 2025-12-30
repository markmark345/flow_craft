"use client";

import type { ComponentPropsWithoutRef, MouseEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/shared/lib/cn";
import { Icon } from "@/shared/components/icon";

type Props = Omit<ComponentPropsWithoutRef<"button">, "type" | "onChange"> & {
  checked: boolean;
  indeterminate?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  uiSize?: "sm" | "md";
  stopPropagation?: boolean;
};

export function Checkbox({
  checked,
  indeterminate,
  onCheckedChange,
  disabled,
  className,
  uiSize = "sm",
  stopPropagation,
  onClick,
  onMouseDown,
  ...buttonProps
}: Props) {
  const toggledOnMouseDownRef = useRef(false);
  const [visualChecked, setVisualChecked] = useState(checked);
  const [visualIndeterminate, setVisualIndeterminate] = useState(Boolean(indeterminate));

  useEffect(() => setVisualChecked(checked), [checked]);
  useEffect(() => setVisualIndeterminate(Boolean(indeterminate)), [indeterminate]);

  const boxSize = uiSize === "md" ? "h-5 w-5" : "h-4 w-4";
  const iconSize = uiSize === "md" ? "text-[14px]" : "text-[12px]";

  const state = visualIndeterminate ? "indeterminate" : visualChecked ? "checked" : "unchecked";

  const getNextChecked = () => (visualIndeterminate ? true : !visualChecked);

  const handleMouseDown = (event: MouseEvent<HTMLButtonElement>) => {
    if (stopPropagation) event.stopPropagation();
    onMouseDown?.(event);
    if (disabled) return;
    if (event.button !== 0) return;

    toggledOnMouseDownRef.current = true;

    const nextChecked = getNextChecked();
    setVisualIndeterminate(false);
    setVisualChecked(nextChecked);
    onCheckedChange?.(nextChecked);
  };

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (stopPropagation) event.stopPropagation();
    onClick?.(event);
    if (disabled) return;

    if (event.detail > 0 && toggledOnMouseDownRef.current) {
      toggledOnMouseDownRef.current = false;
      return;
    }

    toggledOnMouseDownRef.current = false;

    const nextChecked = getNextChecked();
    setVisualIndeterminate(false);
    setVisualChecked(nextChecked);
    onCheckedChange?.(nextChecked);
  };

  const ariaChecked = visualIndeterminate ? "mixed" : visualChecked;

  return (
    <button
      {...buttonProps}
      type="button"
      role="checkbox"
      aria-checked={ariaChecked}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center select-none align-middle",
        "rounded-[4px] border transition-colors",
        "focus:outline-none focus-visible:shadow-focus",
        boxSize,
        disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer",
        state === "unchecked"
          ? "border-border bg-panel text-transparent hover:border-[color-mix(in_srgb,var(--accent)_45%,var(--border))]"
          : "border-accent bg-accent text-white",
        className
      )}
      data-state={state}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
    >
      {state === "checked" ? <Icon name="check" className={iconSize} /> : null}
      {state === "indeterminate" ? <Icon name="remove" className={iconSize} /> : null}
    </button>
  );
}
