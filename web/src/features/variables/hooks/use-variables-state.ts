
import { useState } from "react";
import { VariableDTO } from "@/types/dto";

export function useVariablesState() {
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<VariableDTO | null>(null);
  const [draftKey, setDraftKey] = useState("");
  const [draftValue, setDraftValue] = useState("");
  const [saving, setSaving] = useState(false);

  // Delete confirmation
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setDraftKey("");
    setDraftValue("");
    setModalOpen(true);
  };

  const openEdit = (item: VariableDTO) => {
    setEditing(item);
    setDraftKey(item.key);
    setDraftValue(item.value);
    setModalOpen(true);
  };

  const closeConfirmDelete = () => {
    setConfirmDeleteOpen(false);
    setSelectedId(null);
  };

  return {
    // Modal
    modalOpen,
    setModalOpen,
    editing,
    draftKey,
    setDraftKey,
    draftValue,
    setDraftValue,
    saving,
    setSaving,
    openCreate,
    openEdit,

    // Delete
    confirmDeleteOpen,
    setConfirmDeleteOpen,
    selectedId,
    setSelectedId,
    deleting,
    setDeleting,
    closeConfirmDelete,
  };
}
