
import { useBuilderStore } from "../../store/use-builder-store";

export function computeCanvasCenterPosition() {
  const viewport = useBuilderStore.getState().viewport;
  const zoom = viewport?.zoom || 1;
  if (typeof document === "undefined") return { x: 0, y: 0 };
  const el = document.querySelector<HTMLElement>(".fc-canvas");
  if (!el) return { x: 0, y: 0 };
  const rect = el.getBoundingClientRect();
  const screenX = rect.width / 2;
  const screenY = rect.height / 2;
  return {
    x: (screenX - (viewport?.x || 0)) / zoom,
    y: (screenY - (viewport?.y || 0)) / zoom,
  };
}
