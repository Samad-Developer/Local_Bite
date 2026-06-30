"use client";

import { Route } from "next";
import { Category } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useDelete } from "@/hooks/useDelete";
import { menuItemColumns, MenuItem } from "./config";
import PageHeader from "@/components/shared/PageHeader";
import { DataTable } from "@/components/shared/DataTable";
import { deleteMenuItem } from "@/lib/actions/items/Items";
import { DeleteModal } from "@/components/shared/DeleteModal";

export default function MenuItemsClient({
  menuItems,
  categories,
}: {
  menuItems: MenuItem[];
  categories: Category[];
}) {

  const {
    isDeleting,
    deleteTarget,
    closeDeleteModal,
    handleDeleteConfirm,
    handleDeleteClick,
  } = useDelete<MenuItem>({
    deleteAction: deleteMenuItem,
    getId: (row) => row.id,
  });

  const router = useRouter();

  return (
    <>
      <PageHeader
        title="Menu Items"
        buttonLabel="Add Item"
        onButtonClick={() => router.push("/menu/items/new" as Route)}
      />

      <DataTable
        columns={menuItemColumns(() => { }, handleDeleteClick, (id) => router.push(`/menu/items/${id}/edit` as Route))}
        data={menuItems}
        searchKey="name"
        searchPlaceholder="Search menu items..."
      />

      <DeleteModal
        open={deleteTarget !== null}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteConfirm}
        title="Delete Item"
        isPending={isDeleting}
      />
    </>
  );
}
