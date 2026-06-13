"use client";

import { useState, useTransition } from "react";
import { useForm, FieldValues, DefaultValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ZodSchema } from "zod";

interface UseCrudFormOptions<TRecord, TFormData extends FieldValues> {
  schema: ZodSchema<TFormData>;
  defaultValues: TFormData;

  // converts a table row into form values when editing
  toFormValues?: (record: TRecord) => TFormData;

  // gets the id from a record — used when calling updateAction
  getId: (record: TRecord) => string;

  // server action for create and update
  createAction: (
    data: TFormData,
  ) => Promise<{ success?: boolean; error?: string }>;
  updateAction: (
    data: TFormData & { id: string },
  ) => Promise<{ success?: boolean; error?: string }>;
}

export function useCrudForm<TRecord, TFormData extends FieldValues>({
  schema,
  defaultValues,
  toFormValues,
  getId,
  createAction,
  updateAction,
}: UseCrudFormOptions<TRecord, TFormData>) {
  const [modalOpen, setModalOpen] = useState(false);
  const [record, setRecord] = useState<TRecord | null>(null);
  const [serverError, setServerError] = useState("");
  const [isPending, startTransition] = useTransition();

  const form = useForm<TFormData>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as DefaultValues<TFormData>,
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

  function onSubmit(data: TFormData) {
    setServerError("");
    startTransition(async () => {
      const result = record
        ? await updateAction({ ...data, id: getId(record) })
        : await createAction(data);

      if (result?.error) {
        setServerError(result.error);
        return;
      }

      handleClose();
    });
  }

  return {
    form,
    modalOpen,
    record,
    serverError,
    isPending,
    isEditing: record !== null,
    handleCreate,
    handleEdit,
    handleClose,
    onSubmit,
  };
}
