"use client";

import { useCallback, useState } from "react";
import { createFlow, deleteFlow, getFlow, updateFlow } from "../services/flowsApi";
import { useFlowsStore } from "../store/use-flows-store";
import { useAppStore } from "@/shared/hooks/use-app-store";
import { FlowDTO } from "@/shared/types/dto";

type ImportResult = {
  flow: FlowDTO;
};

export function useFlowActions() {
  const addFlow = useFlowsStore((s) => s.addFlow);
  const upsertFlow = useFlowsStore((s) => s.upsertFlow);
  const removeFlow = useFlowsStore((s) => s.removeFlow);
  const showSuccess = useAppStore((s) => s.showSuccess);
  const showError = useAppStore((s) => s.showError);

  const [importing, setImporting] = useState(false);
  const [duplicatingId, setDuplicatingId] = useState<string | undefined>(undefined);
  const [archivingId, setArchivingId] = useState<string | undefined>(undefined);
  const [deletingId, setDeletingId] = useState<string | undefined>(undefined);

  const importFlowFromFile = useCallback(
    async (file: File): Promise<ImportResult> => {
      setImporting(true);
      try {
        const raw = await file.text();
        const parsed = JSON.parse(raw);
        const name = typeof parsed?.name === "string" ? parsed.name : file.name.replace(/\.json$/i, "");
        const definitionJson = JSON.stringify({ ...parsed, name });

        const flow = await createFlow({
          name,
          status: "draft",
          version: 1,
          definitionJson,
        });

        addFlow(flow);
        showSuccess("Flow imported", flow.name);
        return { flow };
      } catch (err: any) {
        showError("Import failed", err?.message || "Unable to import flow");
        throw err;
      } finally {
        setImporting(false);
      }
    },
    [addFlow, showError, showSuccess]
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

        const created = await createFlow({
          name: nextName,
          status: "draft",
          version: 1,
          definitionJson: nextDef || "{}",
        });

        addFlow(created);
        showSuccess("Flow duplicated", created.name);
        return created;
      } catch (err: any) {
        showError("Duplicate failed", err?.message || "Unable to duplicate flow");
        throw err;
      } finally {
        setDuplicatingId(undefined);
      }
    },
    [addFlow, showError, showSuccess]
  );

  const archiveExistingFlow = useCallback(
    async (flow: FlowDTO): Promise<FlowDTO> => {
      setArchivingId(flow.id);
      try {
        const updated = await updateFlow(flow.id, { status: "archived" });
        upsertFlow(updated);
        showSuccess("Flow archived", updated.name);
        return updated;
      } catch (err: any) {
        showError("Archive failed", err?.message || "Unable to archive flow");
        throw err;
      } finally {
        setArchivingId(undefined);
      }
    },
    [showError, showSuccess, upsertFlow]
  );

  const deleteExistingFlow = useCallback(
    async (flow: FlowDTO): Promise<void> => {
      setDeletingId(flow.id);
      try {
        await deleteFlow(flow.id);
        removeFlow(flow.id);
        showSuccess("Flow deleted", flow.name);
      } catch (err: any) {
        showError("Delete failed", err?.message || "Unable to delete flow");
        throw err;
      } finally {
        setDeletingId(undefined);
      }
    },
    [removeFlow, showError, showSuccess]
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

