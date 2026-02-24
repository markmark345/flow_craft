
import { useMemo } from "react";
import { MarkerType } from "reactflow";
import { useRunStepsQuery } from "@/features/runs/hooks/use-run-steps";
import { useAppStore } from "@/hooks/use-app-store";
import { useBuilderStore } from "../store/use-builder-store";

export function useCanvasDisplay(activeRunId?: string) {
  const nodes = useBuilderStore((s) => s.nodes);
  const edges = useBuilderStore((s) => s.edges);
  const reduceMotion = useAppStore((s) => s.reduceMotion);

  const { steps } = useRunStepsQuery(activeRunId);

  // Map steps by node ID for quick lookup
  const stepByNodeId = useMemo(() => {
    const map = new Map<string, (typeof steps)[number]>();
    for (const step of steps) {
      if (step.nodeId) map.set(step.nodeId, step);
    }
    return map;
  }, [steps]);

  // Display nodes with runtime status
  const displayNodes = useMemo(() => {
    if (!activeRunId) return nodes;
    return nodes.map((node) => {
      const step = stepByNodeId.get(node.id);
      if (!step) return node;
      return {
        ...node,
        data: {
          ...node.data,
          runtimeStatus: step.status,
          runtimeStepKey: step.stepKey,
          runtimePulse: !reduceMotion,
        },
      };
    });
  }, [activeRunId, nodes, reduceMotion, stepByNodeId]);

  // Edge styling constant
  const baseEdgeStroke = "color-mix(in srgb, var(--muted) 70%, var(--border))";

  // Display edges with runtime styling
  const displayEdges = useMemo(() => {
    return edges.map((edge) => {
      const sourceStatus = activeRunId ? stepByNodeId.get(edge.source)?.status : undefined;
      const targetStatus = activeRunId ? stepByNodeId.get(edge.target)?.status : undefined;

      const anyRunning = sourceStatus === "running" || targetStatus === "running";
      const animateRunning = Boolean(activeRunId && !reduceMotion && anyRunning);
      const anyFailed = sourceStatus === "failed" || targetStatus === "failed";
      const anyCanceled = sourceStatus === "canceled" || targetStatus === "canceled";
      const completed = sourceStatus === "success" && targetStatus === "success";

      let stroke = baseEdgeStroke;
      if (activeRunId) {
        if (anyFailed) stroke = "var(--error)";
        else if (anyRunning) stroke = "var(--accent)";
        else if (completed) stroke = "var(--success)";
        else if (anyCanceled) stroke = "var(--muted)";
      }

      const selected = Boolean(edge.selected);
      if (selected) {
        stroke = `color-mix(in srgb, var(--accent-strong) 65%, ${stroke})`;
      }

      const strokeWidth = selected ? 4 : anyRunning || anyFailed || completed ? 3 : 2.5;

      return {
        ...edge,
        animated: activeRunId ? animateRunning : edge.animated,
        zIndex: selected ? 1000 : edge.zIndex,
        style: {
          ...(edge.style || {}),
          stroke,
          strokeWidth,
          opacity: selected ? 1 : 0.95,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 14,
          height: 14,
          color: stroke,
        },
        interactionWidth: 24,
      };
    });
  }, [activeRunId, baseEdgeStroke, edges, reduceMotion, stepByNodeId]);

  return {
    displayNodes,
    displayEdges,
    steps,
    baseEdgeStroke,
  };
}
