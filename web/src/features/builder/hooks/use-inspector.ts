import { useEffect, useMemo, useState } from "react";
import { useBuilderStore } from "../store/use-builder-store";
import { useRunStepsStore } from "@/features/runs/store/use-run-steps-store";
import type { RunStepDTO } from "@/shared/types/dto";

export type InspectorTab = "config" | "io" | "notes";

export interface UseInspectorReturn {
  // Tab state
  tab: InspectorTab;
  setTab: (tab: InspectorTab) => void;

  // Selection state
  selectedNode: ReturnType<typeof useBuilderStore.getState>["nodes"][number] | undefined;
  selectedEdge: ReturnType<typeof useBuilderStore.getState>["edges"][number] | undefined;
  selectedNodeId: string | undefined;
  selectedEdgeId: string | undefined;

  // Node/Edge data for rendering
  sourceNode: ReturnType<typeof useBuilderStore.getState>["nodes"][number] | undefined;
  targetNode: ReturnType<typeof useBuilderStore.getState>["nodes"][number] | undefined;

  // Run step data
  selectedNodeStep: RunStepDTO | undefined;
  sourceStep: RunStepDTO | undefined;
  targetStep: RunStepDTO | undefined;
  activeRunId: string | null;

  // Actions
  updateNodeData: ReturnType<typeof useBuilderStore.getState>["updateNodeData"];
  updateNodeConfig: ReturnType<typeof useBuilderStore.getState>["updateNodeConfig"];
  deleteNode: ReturnType<typeof useBuilderStore.getState>["deleteNode"];
  duplicateNode: ReturnType<typeof useBuilderStore.getState>["duplicateNode"];
}

/**
 * Custom hook for managing Inspector panel state and logic.
 * Handles tab navigation, node/edge selection, and run step data.
 */
export function useInspector(): UseInspectorReturn {
  const [tab, setTab] = useState<InspectorTab>("config");

  // Builder store state
  const selectedNodeId = useBuilderStore((s) => s.selectedNodeId);
  const selectedEdgeId = useBuilderStore((s) => s.selectedEdgeId);
  const nodes = useBuilderStore((s) => s.nodes);
  const edges = useBuilderStore((s) => s.edges);
  const activeRunId = useBuilderStore((s) => s.activeRunId);
  const updateNodeData = useBuilderStore((s) => s.updateNodeData);
  const updateNodeConfig = useBuilderStore((s) => s.updateNodeConfig);
  const deleteNode = useBuilderStore((s) => s.deleteNode);
  const duplicateNode = useBuilderStore((s) => s.duplicateNode);

  // Find selected node and edge
  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedNodeId),
    [nodes, selectedNodeId]
  );
  const selectedEdge = useMemo(
    () => edges.find((e) => e.id === selectedEdgeId),
    [edges, selectedEdgeId]
  );

  // Auto-switch to I/O tab when edge is selected
  useEffect(() => {
    if (!selectedEdge) return;
    setTab("io");
  }, [selectedEdgeId, selectedEdge]);

  // Get run steps for active run
  const steps =
    useRunStepsStore((s) => (activeRunId ? s.stepsByRunId[activeRunId] : undefined)) || [];

  // Map steps by node ID for quick lookup
  const stepByNodeId = useMemo(() => {
    const map = new Map<string, RunStepDTO>();
    for (const step of steps) {
      if (step.nodeId) map.set(step.nodeId, step);
    }
    return map;
  }, [steps]);

  // Get step data for selected node
  const selectedNodeStep = selectedNode ? stepByNodeId.get(selectedNode.id) : undefined;

  // Get source and target nodes for selected edge
  const sourceNode = selectedEdge ? nodes.find((n) => n.id === selectedEdge.source) : undefined;
  const targetNode = selectedEdge ? nodes.find((n) => n.id === selectedEdge.target) : undefined;

  // Get step data for source and target nodes
  const sourceStep = selectedEdge ? stepByNodeId.get(selectedEdge.source) : undefined;
  const targetStep = selectedEdge ? stepByNodeId.get(selectedEdge.target) : undefined;

  return {
    // Tab state
    tab,
    setTab,

    // Selection state
    selectedNode,
    selectedEdge,
    selectedNodeId,
    selectedEdgeId,

    // Node/Edge data
    sourceNode,
    targetNode,

    // Run step data
    selectedNodeStep,
    sourceStep,
    targetStep,
    activeRunId: activeRunId ?? null,

    // Actions
    updateNodeData,
    updateNodeConfig,
    deleteNode,
    duplicateNode,
  };
}
