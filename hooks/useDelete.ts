"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

interface deleteOptions<TRecord> {
    getId: (record: TRecord) => string;
    deleteAction: ( id: string ) => Promise<{ success?: boolean; error?: string; message?: string }>;
}

// it will get delete action and may delete target type
export function useDelete<TRecord>({
  deleteAction,
  getId,
}: deleteOptions<TRecord>) {
  // delete states
  const [deleteTarget, setDeleteTarget] = useState<TRecord | null>(null);

  const [isDeleting, startDeleteTransition] = useTransition();

  function handleDeleteClick(row: TRecord) {
    setDeleteTarget(row);
  }

  function closeDeleteModal() {
    setDeleteTarget(null);
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return;

    startDeleteTransition(async () => {
      const result = await deleteAction(getId(deleteTarget));

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(result.message);
        setDeleteTarget(null);
      }
    });
  }

  return {
    isDeleting,
    deleteTarget,
    closeDeleteModal,
    handleDeleteClick,
    handleDeleteConfirm,
  };
}
