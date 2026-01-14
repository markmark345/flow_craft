import { useMemo } from "react";
import type { Viewport } from "reactflow";

export interface UseStickyNotesLayerReturn {
  transform: string;
  zoom: number;
}

/**
 * Custom hook for computing viewport transformation for sticky notes layer.
 * Calculates CSS transform string and zoom level from ReactFlow viewport.
 */
export function useStickyNotesLayer(viewport: Viewport): UseStickyNotesLayerReturn {
  const zoom = viewport.zoom || 1;

  const transform = useMemo(
    () => `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
    [viewport.x, viewport.y, viewport.zoom]
  );

  return {
    transform,
    zoom,
  };
}
