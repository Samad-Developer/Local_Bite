"use client";

import { Control } from "react-hook-form";
import { useState, useTransition } from "react";
import { useCrudForm } from "@/hooks/use-crud-form";
import { AppModal } from "@/components/shared/AppModal";
import PageHeader from "@/components/shared/PageHeader";
import { DataTable } from "@/components/shared/DataTable";
import {
  categorySchema,
  categoryDefaultValues,
  categoryFields,
  categoryColumns,
  Category,
  CategoryFormData,
} from "./config";
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/actions/categories";
import { FormRenderer } from "@/components/shared/form/FormRenderer";
import { DeleteModal } from "@/components/shared/DeleteModal";

export default function CategoriesClient({
  categories,
}: {
  categories: Category[];
}) {
  // delete states
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [isDeleting, startDeleteTransition] = useTransition();

  // reusable form hook which handle form related things and create, update, submit handlers 
  const {
    form,
    modalOpen,
    serverError,
    isPending,
    isEditing,
    handleCreate,
    handleEdit,
    handleClose,
    onSubmit,
  } = useCrudForm<Category, CategoryFormData>({
    schema: categorySchema,
    defaultValues: categoryDefaultValues,
    toFormValues: (row) => ({
      name: row.name,
      sortOrder: row.sortOrder,
      isVisible: row.isVisible,
    }),
    getId: (row) => row.id,
    createAction: createCategory,
    updateAction: updateCategory,
  });

  function handleDeleteConfirm() {
    if (!deleteTarget) return;
    startDeleteTransition(async () => {
      const result = await deleteCategory(deleteTarget.id);
      if (result?.error) {
        setDeleteError(result.error);
      }
      setDeleteTarget(null);
    });
  }

  return (
    <>
      <PageHeader
        title="Categories List"
        buttonLabel="Add Category"
        onButtonClick={handleCreate}
      />

      {deleteError && (
        <div className="bg-[#fef2f2] border border-[#fecaca] rounded-lg px-4 py-3 mb-4">
          <p className="text-sm text-[#dc2626]">{deleteError}</p>
        </div>
      )}

      <DataTable
        columns={categoryColumns(handleEdit, (row) => setDeleteTarget(row))}
        data={categories}
        searchKey="name"
        searchPlaceholder="Search categories..."
      />

      {/* Create / Edit Form Modal */}
      <AppModal
        open={modalOpen}
        onClose={handleClose}
        title={isEditing ? "Edit Category" : "Add Category"}
        isPending={isPending}
        isEditing={isEditing}
        formId="category-form"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormRenderer
          fields={categoryFields}
          control={form.control as Control<any>}
        />

        {serverError && (
          <p className="text-sm text-[#dc2626] bg-[#fef2f2] border border-[#fecaca] rounded-lg px-3 py-2 mt-4">
            {serverError}
          </p>
        )}
      </AppModal>

      {/* Delete Confirmation Modal */}
      <DeleteModal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Category"
        isPending={isDeleting}
      />
    </>
  );
}
