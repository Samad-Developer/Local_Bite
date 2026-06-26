"use client";

import { Control } from "react-hook-form";
import { useState, useTransition } from "react";
import { useCrudForm } from "@/hooks/useCrudForm";
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
} from "@/lib/actions/categories/categories";
import { FormRenderer } from "@/components/shared/form/FormRenderer";
import { DeleteModal } from "@/components/shared/DeleteModal";
import { useDelete } from "@/hooks/useDelete";

export default function CategoriesClient({ categories }: {
  categories: Category[];
}) {

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

  const {
    isDeleting,
    deleteTarget,
    closeDeleteModal,
    handleDeleteConfirm,
    handleDeleteClick
  } = useDelete<Category>({
    deleteAction: deleteCategory,
    getId: ((row) => row.id)
  })

  return (
    <>
      <PageHeader
        title="Categories List"
        buttonLabel="Add Category"
        onButtonClick={handleCreate}
      />

      <DataTable
        columns={categoryColumns(handleEdit, handleDeleteClick)}
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
        onClose={closeDeleteModal}
        onConfirm={handleDeleteConfirm}
        title="Delete Category"
        isPending={isDeleting}
      />
    </>
  );
}
