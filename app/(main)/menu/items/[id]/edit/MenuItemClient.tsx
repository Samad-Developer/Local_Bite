"use client";

import { Control } from "react-hook-form";
import { useCrudForm } from "@/hooks/useCrudForm";
import { FormRenderer } from "@/components/shared/form/FormRenderer";
import { ImageUploadField } from "@/components/shared/image/image-upload-field";
import {
  MenuItem,
  MenuItemFormData,
  menuItemSchema,
  menuItemDefaultValues,
  menuItemFields,
  Category,
} from "../../config";
import { createMenuItem, updateMenuItem } from "@/lib/actions/items/Items";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useRouter } from "next/navigation";

interface MenuItemClientProps {
  categories: Category[];
  item?: MenuItem;
}

export const MenuItemClient = ({ categories, item }: MenuItemClientProps) => {
  const router = useRouter();

  const { form, serverError, isPending, onSubmit, handleEdit, isEditing } =
    useCrudForm<MenuItem, MenuItemFormData>({
      schema: menuItemSchema,
      defaultValues: menuItemDefaultValues,
      initialRecord: item,
      toFormValues: (row) => ({
        name: row.name,
        defaultPrice: row.variants.find((v) => v.isDefault)?.price ?? 0,
        description: row.description ?? "",
        categoryId: row.categoryId,
        isBestseller: row.isBestseller,
        isNew: row.isNew,
        sortOrder: row.sortOrder,
        isAvailable: row.isAvailable,
        imageUrls: row.images.map((img) => img.url),
      }),
      onSuccess: () => {
        router.push("/menu/items");
      },
      getId: (row) => row.id,
      createAction: createMenuItem,
      updateAction: updateMenuItem,
    });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div className="space-y-4 mx-auto">
        <h1 className="text-2xl font-semibold text-[#111111] mb-4">
          {isEditing ? "Edit Product" : "Create Product"}
        </h1>
        <FormRenderer
          fields={menuItemFields(categories)}
          control={form.control as Control<any>}
          className="grid grid-cols-3 gap-5"
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

        <Button
          type="submit"
          size="lg"
          variant="default"
          disabled={isPending}
          className="w-full"
        >
          {isPending ? (
            <>
              <Spinner />
              {isEditing ? "Saving..." : "Creating..."}
            </>
          ) : isEditing ? (
            "Save Changes"
          ) : (
            "Create"
          )}
        </Button>
      </div>
    </form>
  );
};
