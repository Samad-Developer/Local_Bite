"use client";

import PageHeader from "@/components/shared/PageHeader";
import {
  discountFormDefaultValues,
  discountSchema,
  Discount,
  DiscountFormData,
} from "./config";
import { useCrudForm } from "@/hooks/useCrudForm";
import { AppModal } from "@/components/shared/AppModal";
import { FormRenderer } from "@/components/shared/form/FormRenderer";
import { discountFields } from "./config";
import { type ZodType } from "zod";
import { Control } from "react-hook-form";
import {
  updateDiscount,
  createDiscount,
} from "@/lib/actions/discounts/discount";
import { Category } from "../categories/config";
import { MenuItem } from "../items/config";

const DiscountClient = ({
  discounts,
  categories,
  products,
}: {
  discounts: Discount[];
  categories: Category[];
  products: MenuItem[];
}) => {
  const handleCreateDiscount = () => {};

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

  return (
    <>
      <PageHeader
        title="Manage Discounts"
        buttonLabel="Create Discount"
        onButtonClick={handleCreate}
      />

      {/*TODO: data table will display here */}

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
          className="grid grid-cols-3 gap-2"
        />
      </AppModal>
    </>
  );
};

export default DiscountClient;
