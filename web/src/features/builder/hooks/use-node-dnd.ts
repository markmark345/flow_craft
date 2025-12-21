import { useCallback } from "react";
import { useBuilderStore } from "../store/use-builder-store";
import { BuilderNodeType } from "../types";

export type PaletteItem = {
  type: BuilderNodeType;
  label: string;
};

export function useNodeDnd() {
  const addNode = useBuilderStore((s) => s.addNode);

  const onDragStart = useCallback((event: React.DragEvent, item: PaletteItem) => {
    event.dataTransfer.setData("application/reactflow/node-type", item.type);
    event.dataTransfer.setData("application/reactflow/node-label", item.label);
    event.dataTransfer.effectAllowed = "move";
  }, []);

  const createNodeAt = useCallback(
    (type: BuilderNodeType, label: string, position: { x: number; y: number }) => {
      addNode(type, position, label);
    },
    [addNode]
  );

  return { onDragStart, createNodeAt };
}
