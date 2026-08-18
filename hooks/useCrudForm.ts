"use client";

import { useState, useTransition } from "react";
import { useForm, FieldValues, DefaultValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ZodSchema } from "zod";
import { toast } from "sonner";

interface UseCrudFormOptions<TRecord, TFormData extends FieldValues> {
  schema: ZodSchema<TFormData>;
  defaultValues: TFormData;

  initialRecord?: TRecord;

  toFormValues?: (record: TRecord) => TFormData;

  onSuccess?: () => void;

  getId: (record: TRecord) => string;

  createAction: (data: TFormData) => Promise<{ success?: boolean; error?: string; message?: string }>;
  updateAction: (data: TFormData & { id: string }) => Promise<{ success?: boolean; error?: string; message?: string }>;
}

export function useCrudForm<TRecord, TFormData extends FieldValues>({
  schema,
  defaultValues,
  initialRecord,
  toFormValues,
  onSuccess,
  getId,
  createAction,
  updateAction,
}: UseCrudFormOptions<TRecord, TFormData>) {
  const [modalOpen, setModalOpen] = useState(false);
  const [record, setRecord] = useState<TRecord | null>(initialRecord ?? null);
  const [serverError, setServerError] = useState("");

  const resolvedDefaults =
    initialRecord && toFormValues ? toFormValues(initialRecord) : defaultValues;

  const form = useForm<TFormData>({
    resolver: zodResolver(schema),
    defaultValues: resolvedDefaults as DefaultValues<TFormData>,
    mode: "onSubmit",
  });

  function handleCreate() {
    setRecord(null);
    setServerError("");
    form.reset(defaultValues as DefaultValues<TFormData>);
    setModalOpen(true);
  }

  function handleEdit(row: TRecord) {
    setRecord(row);
    setServerError("");
    const values = toFormValues
      ? toFormValues(row)
      : (row as unknown as TFormData);
    form.reset(values as DefaultValues<TFormData>);
    setModalOpen(true);
  }

  function handleClose() {
    setModalOpen(false);
    setRecord(null);
    setServerError("");
  }

  async function onSubmit(data: TFormData) {
    setServerError("");    
    try {
      const result = record
        ? await updateAction({ ...data, id: getId(record) })
        : await createAction(data);

      if (result?.error) {
        setServerError(result.error);
        return;
      }

      handleClose();
      toast.success(
        result?.message ??
          (record
            ? "Record updated successfully"
            : "Record created successfully"),
      );
      onSuccess?.();
    } finally {
    }
  }

  return {
    form,
    modalOpen,
    record,
    serverError,
    isPending: form.formState.isSubmitting,
    isEditing: record !== null,
    handleCreate,
    handleEdit,
    handleClose,
    onSubmit,
  };
}
