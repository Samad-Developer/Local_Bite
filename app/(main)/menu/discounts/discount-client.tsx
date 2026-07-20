"use client";

import PageHeader from "@/components/shared/PageHeader";
import {
  discountFormDefaultValues,
  discountSchema,
  Discount,
  DiscountFormData,
  discountTableColumns,
} from "./config";
import { useCrudForm } from "@/hooks/useCrudForm";
import { AppModal } from "@/components/shared/AppModal";
import { FormRenderer } from "@/components/shared/form/FormRenderer";
import { discountFields } from "./config";
import { Control } from "react-hook-form";
import {
  updateDiscount,
  createDiscount,
  deleteDiscount
} from "@/lib/actions/discounts/discount";
import { Category } from "../categories/config";
import { MenuItem } from "../items/config";
import { DataTable } from "@/components/shared/DataTable";
import { useDelete } from "@/hooks/useDelete";
import { DeleteModal } from "@/components/shared/DeleteModal";
interface discountProps {
  discounts: Discount[];
  categories: Category[];
  products: MenuItem[];
}

const DiscountClient = ({ discounts, categories, products }: discountProps) => {

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
  } = useCrudForm<Discount, DiscountFormData>({
    schema: discountSchema,
    defaultValues: discountFormDefaultValues,
    toFormValues: (row) => ({
      name: row.name,
      type: row.type,
      value: row.value,
      startDate: row.startDate ?? undefined,
      endDate: row.endDate ?? undefined,
      isActive: row.isActive,
      productIds: row.items
        .filter((item) => item.menuItemId !== null)
        .map((item) => item.menuItemId as string),
      categoryIds: row.items
        .filter((item) => item.categoryId !== null)
        .map((item) => item.categoryId as string),
    }),
    getId: (row) => row.id,
    createAction: createDiscount,
    updateAction: updateDiscount,
  });

  const {
    isDeleting,
    deleteTarget,
    closeDeleteModal,
    handleDeleteConfirm,
    handleDeleteClick,
  } = useDelete<Discount>({
    deleteAction: deleteDiscount,
    getId: (row) => row.id,
  });

  return (
    <>
      <PageHeader
        title="Manage Discounts"
        buttonLabel="Create Discount"
        onButtonClick={handleCreate}
      />
      <DataTable
        columns={discountTableColumns(handleEdit, handleDeleteClick)}
        data={discounts}
        searchKey="name"
        searchPlaceholder="Search Discounts..."
      />
      {/* Create / Edit Form Modal */}
      <AppModal
        open={modalOpen}
        onClose={handleClose}
        title={isEditing ? "Edit Discount" : "Create Discount"}
        isPending={isPending}
        isEditing={isEditing}
        size="lg"
        formId="discount-form"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormRenderer
          fields={discountFields(products, categories)}
          control={form.control as Control<any>}
          className="grid grid-cols-3 gap-5"
        />
      </AppModal>

      <DeleteModal
        open={deleteTarget !== null}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteConfirm}
        title="Delete Discount"
        isPending={isDeleting}
      />
    </>
  );
};

export default DiscountClient;
