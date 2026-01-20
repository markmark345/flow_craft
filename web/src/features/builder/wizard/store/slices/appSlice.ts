
import { StateCreator } from "zustand";
import { useBuilderStore } from "../../../store/use-builder-store";
import { WizardState, AppNodeDraft, AppSlice } from "../types";
import { request } from "@/lib/fetcher";
import { API_BASE_URL } from "@/lib/env";
import { computeCanvasCenterPosition } from "../ui-utils";

type NodeTestResult = { success: boolean; message?: string; data?: unknown };

export const createAppSlice: StateCreator<WizardState, [], [], AppSlice> = (set, get) => ({
  runAppTest: async () => {
      const { draft } = get();
      const d = draft as AppNodeDraft;
      if (!d.app || !d.action) throw new Error("Select an app and action first");
      const provider = d.app;
      const res = await request<{ data: NodeTestResult }>(`${API_BASE_URL}/nodes/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "app-action",
          provider,
          action: d.action,
          credentialId: d.config.credentialId,
          config: d.config,
        }),
        timeoutMs: 20_000,
      });
      return res.data;
  },

  confirmAppNode: () => {
    const { draft } = get();
    const d = draft as AppNodeDraft;
    if (!d.app || !d.action) throw new Error("Missing app/action");
    const pos = computeCanvasCenterPosition();
    const addNode = useBuilderStore.getState().addNode;
    addNode("app", pos, d.label);
    const nodeId = useBuilderStore.getState().selectedNodeId;
    if (!nodeId) return;
    useBuilderStore.getState().updateNodeConfig(nodeId, {
      ...d.config,
      app: d.app,
      action: d.action,
    });
  }
});
