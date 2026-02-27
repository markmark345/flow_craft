"use client";
import { getErrorMessage } from "@/lib/error-utils";

import { useCallback, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteFlow, getFlow, updateFlow } from "../services/flowsApi";
import { useAppStore } from "@/hooks/use-app-store";
import { FlowDTO } from "@/types/dto";
import { createWorkflow } from "@/features/workflows/services/workflowsApi";
import { useWorkspaceStore } from "@/features/workspaces/store/use-workspace-store";

type ImportResult = {
  flow: FlowDTO;
};

export function useFlowActions() {
  const queryClient = useQueryClient();
  const showSuccess = useAppStore((s) => s.showSuccess);
  const showError = useAppStore((s) => s.showError);

  const [importing, setImporting] = useState(false);
  const [duplicatingId, setDuplicatingId] = useState<string | undefined>(undefined);
  const [archivingId, setArchivingId] = useState<string | undefined>(undefined);
  const [deletingId, setDeletingId] = useState<string | undefined>(undefined);

  const scope = useWorkspaceStore((s) => s.activeScope);
  const projectId = useWorkspaceStore((s) => s.activeProjectId);

  const invalidateFlows = () => queryClient.invalidateQueries({ queryKey: ["flows"] });

  const createInActiveScope = useCallback(
    async (payload: Omit<Parameters<typeof createWorkflow>[0], "scope" | "projectId">) => {
      if (scope === "project" && projectId) {
        return createWorkflow({ ...payload, scope: "project", projectId });
      }
      return createWorkflow({ ...payload, scope: "personal" });
    },
    [projectId, scope]
  );

  const importMutation = useMutation({
    mutationFn: async (file: File): Promise<FlowDTO> => {
      const raw = await file.text();
      const parsed = JSON.parse(raw);
      const name = typeof parsed?.name === "string" ? parsed.name : file.name.replace(/\.json$/i, "");
      const definitionJson = JSON.stringify({ ...parsed, name });
      return createInActiveScope({ name, status: "draft", version: 1, definitionJson, description: "" });
    },
    onSuccess: (flow) => {
      invalidateFlows();
      showSuccess("Flow imported", flow.name);
    },
    onError: (err) => showError("Import failed", getErrorMessage(err) || "Unable to import flow"),
  });

  const archiveMutation = useMutation({
    mutationFn: (flow: FlowDTO) => updateFlow(flow.id, { status: "archived" }),
    onSuccess: (updated) => {
      invalidateFlows();
      showSuccess("Flow archived", updated.name);
    },
    onError: (err) => showError("Archive failed", getErrorMessage(err) || "Unable to archive flow"),
  });

  const deleteMutation = useMutation({
    mutationFn: (flow: FlowDTO) => deleteFlow(flow.id).then(() => flow),
    onSuccess: (flow) => {
      invalidateFlows();
      showSuccess("Flow deleted", flow.name);
    },
    onError: (err) => showError("Delete failed", getErrorMessage(err) || "Unable to delete flow"),
  });

  const importFlowFromFile = useCallback(
    async (file: File): Promise<ImportResult> => {
      setImporting(true);
      try {
        const flow = await importMutation.mutateAsync(file);
        return { flow };
      } finally {
        setImporting(false);
      }
    },
    [importMutation]
  );

  const duplicateExistingFlow = useCallback(
    async (flow: FlowDTO): Promise<FlowDTO> => {
      setDuplicatingId(flow.id);
      try {
        let definitionJson = flow.definitionJson;
        if (!definitionJson) {
          const full = await getFlow(flow.id);
          definitionJson = full.definitionJson;
        }
        const nextName = `${flow.name} copy`;
        let nextDef = definitionJson;
        if (typeof definitionJson === "string" && definitionJson.trim()) {
          try {
            const parsed = JSON.parse(definitionJson);
            nextDef = JSON.stringify({ ...parsed, id: "", name: nextName });
          } catch {
            nextDef = definitionJson;
          }
        }
        const created = await createInActiveScope({
          name: nextName,
          status: "draft",
          version: 1,
          definitionJson: nextDef || "{}",
          description: flow.description || "",
        });
        queryClient.invalidateQueries({ queryKey: ["flows"] });
        showSuccess("Flow duplicated", created.name);
        return created;
      } catch (err: unknown) {
        showError("Duplicate failed", getErrorMessage(err) || "Unable to duplicate flow");
        throw err;
      } finally {
        setDuplicatingId(undefined);
      }
    },
    [createInActiveScope, queryClient, showError, showSuccess]
  );

  const archiveExistingFlow = useCallback(
    async (flow: FlowDTO): Promise<FlowDTO> => {
      setArchivingId(flow.id);
      try {
        return await archiveMutation.mutateAsync(flow);
      } finally {
        setArchivingId(undefined);
      }
    },
    [archiveMutation]
  );

  const deleteExistingFlow = useCallback(
    async (flow: FlowDTO): Promise<void> => {
      setDeletingId(flow.id);
      try {
        await deleteMutation.mutateAsync(flow);
      } finally {
        setDeletingId(undefined);
      }
    },
    [deleteMutation]
  );

  return {
    importFlowFromFile,
    importing,
    duplicateExistingFlow,
    duplicatingId,
    archiveExistingFlow,
    archivingId,
    deleteExistingFlow,
    deletingId,
  };
}
