"use client"

import { Control } from "react-hook-form"
import { useCrudForm } from "@/hooks/useCrudForm"
import { useDelete } from "@/hooks/useDelete"
import { AppModal } from "@/components/shared/AppModal"
import { DataTable } from "@/components/shared/DataTable"
import { DeleteModal } from "@/components/shared/DeleteModal"
import { FormRenderer } from "@/components/shared/form/FormRenderer"
import PageHeader from "@/components/shared/PageHeader"
import {
  createDeliveryArea,
  updateDeliveryArea,
  deleteDeliveryArea,
} from "@/lib/actions/areas/areas"
import {
  deliveryAreaSchema,
  deliveryAreaDefaultValues,
  deliveryAreaFields,
  deliveryAreaColumns,
  type DeliveryArea,
  type DeliveryAreaFormData,
} from "./config"

export default function DeliveryAreasClient({
  areas,
}: {
  areas: DeliveryArea[]
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
  } = useCrudForm<DeliveryArea, DeliveryAreaFormData>({
    schema: deliveryAreaSchema,
    defaultValues: deliveryAreaDefaultValues,
    toFormValues: (row) => ({
      name: row.name,
      deliveryFee: row.deliveryFee,
      isActive: row.isActive,
    }),
    getId: (row) => row.id,
    createAction: createDeliveryArea,
    updateAction: updateDeliveryArea,
  })

  const {
    deleteTarget,
    isDeleting,
    handleDeleteClick,
    closeDeleteModal,
    handleDeleteConfirm,
  } = useDelete<DeliveryArea>({
    deleteAction: deleteDeliveryArea,
    getId: (row) => row.id,
  })

  return (
    <>
      <PageHeader
        title="Delivery Areas"
        buttonLabel="Add Area"
        onButtonClick={handleCreate}
      />

      <DataTable
        columns={deliveryAreaColumns(handleEdit, handleDeleteClick)}
        data={areas}
        searchKey="name"
        searchPlaceholder="Search areas..."
      />

      <AppModal
        open={modalOpen}
        onClose={handleClose}
        title={isEditing ? "Edit Delivery Area" : "Add Delivery Area"}
        isPending={isPending}
        isEditing={isEditing}
        formId="delivery-area-form"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormRenderer
          fields={deliveryAreaFields}
          control={form.control as Control<any>}
          className="space-y-4"
        />
        {serverError && (
          <p className="text-sm text-[#dc2626] bg-[#fef2f2] border border-[#fecaca] rounded-lg px-3 py-2 mt-4">
            {serverError}
          </p>
        )}
      </AppModal>

      <DeleteModal
        open={deleteTarget !== null}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteConfirm}
        title="Delete Delivery Area"
        isPending={isDeleting}
      />
    </>
  )
}