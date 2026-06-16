"use client";

import { useState, useTransition } from "react";
import { Control } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AppModal } from "@/components/shared/AppModal";
import PageHeader from "@/components/shared/PageHeader";
import { DataTable } from "@/components/shared/DataTable";
import { FormRenderer } from "@/components/shared/form/FormRenderer";
import { DeleteModal } from "@/components/shared/DeleteModal";
import { ImageUploadField } from "@/components/shared/image/image-upload-field";
import { useCrudForm } from "@/hooks/use-crud-form";
// import { useDeleteConfirm } from "@/hooks/use-delete-confirm"
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  menuItemSchema,
  menuItemDefaultValues,
  menuItemFields,
  menuItemColumns,
  MenuItem,
  MenuItemFormData,
  Category,
} from "./config";
import {
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from "@/lib/actions/items/Items";
import AppDrawer from "@/components/shared/AppDrawer";

export default function MenuItemsClient({
  menuItems,
  categories,
}: {
  menuItems: MenuItem[];
  categories: Category[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [, startNavTransition] = useTransition();

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
  } = useCrudForm<MenuItem, MenuItemFormData>({
    schema: menuItemSchema,
    defaultValues: menuItemDefaultValues,
    toFormValues: (row) => ({
      name: row.name,
      description: row.description ?? "",
      basePrice: row.basePrice,
      categoryId: row.categoryId,
      isBestseller: row.isBestseller,
      isNew: row.isNew,
      isAvailable: row.isAvailable,
      imageUrls: row.images.map((img) => img.url),
    }),
    getId: (row) => row.id,
    createAction: createMenuItem,
    updateAction: updateMenuItem,
  });

  //   const {
  //     deleteTarget,
  //     deleteError,
  //     isDeleting,
  //     handleDeleteClick,
  //     handleClose: handleDeleteClose,
  //     handleConfirm: handleDeleteConfirm,
  //   } = useDeleteConfirm<MenuItem>({
  //     deleteAction: deleteMenuItem,
  //     getId: (row) => row.id,
  //   })

  const handleDeleteClick = () => {};

  return (
    <>
      <PageHeader
        title="Menu Items"
        buttonLabel="Add Item"
        onButtonClick={handleCreate}
      />

      {/* {deleteError && (
        <div className="bg-[#fef2f2] border border-[#fecaca] rounded-lg px-4 py-3 mb-4">
          <p className="text-sm text-[#dc2626]">{deleteError}</p>
        </div>
      )} */}

      <DataTable
        columns={menuItemColumns(handleEdit, handleDeleteClick)}
        data={menuItems}
        searchKey="name"
        searchPlaceholder="Search menu items..."
      />

      {/* Create / Edit Modal */}
      <AppDrawer
        open={modalOpen}
        onClose={handleClose}
        title={isEditing ? "Edit Menu Item" : "Add Menu Item"}
        size="lg"
        formId="menu-item-form"
        onSubmit={form.handleSubmit(onSubmit)}
        isPending={isPending}
        isEditing={isEditing}
      >
        <div className="space-y-4">
          <FormRenderer
            fields={menuItemFields(categories)}
            control={form.control as Control<any>}
          />

          <ImageUploadField
            value={form.watch("imageUrls") ?? []}
            onChange={(urls) => form.setValue("imageUrls", urls)}
          />

          {serverError && (
            <p className="text-sm text-[#dc2626] bg-[#fef2f2] border border-[#fecaca] rounded-lg px-3 py-2">
              {serverError}
            </p>
          )}
        </div>
      </AppDrawer>

      {/* Delete Confirmation */}
      {/* <DeleteModal
        open={deleteTarget !== null}
        onClose={handleDeleteClose}
        onConfirm={handleDeleteConfirm}
        title="Delete Menu Item"
        isPending={isDeleting}
      /> */}
    </>
  );
}
