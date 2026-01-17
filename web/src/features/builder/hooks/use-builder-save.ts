import { useState, useCallback } from "react";
import { updateFlow } from "@/features/flows/services/flowsApi";
import { useBuilderStore } from "../store/use-builder-store";
import { useAppStore } from "@/hooks/use-app-store";

type SaveOptions = { silent?: boolean };

export function useBuilderSave(flowId?: string) {
  const serialize = useBuilderStore((s) => s.serializeDefinition);
  const flowName = useBuilderStore((s) => s.flowName);
  const markSaved = useBuilderStore((s) => s.markSaved);
  const dirty = useBuilderStore((s) => s.dirty);
  const showSuccess = useAppStore((s) => s.showSuccess);
  const showError = useAppStore((s) => s.showError);
  const [saving, setSaving] = useState(false);

  const save = useCallback(async (opts: SaveOptions = {}) => {
    if (!flowId) return;
    setSaving(true);
    try {
      const def = serialize();
      await updateFlow(flowId, {
        name: flowName,
        definitionJson: JSON.stringify(def),
      });
      markSaved();
      if (!opts.silent) showSuccess("Flow saved");
    } catch (err: any) {
      showError("Save failed", err?.message || "Unable to save");
      throw err;
    } finally {
      setSaving(false);
    }
  }, [flowId, serialize, flowName, markSaved, showSuccess, showError]);

  return { save, saving, dirty };
}
