"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import type { LocalVariant } from "@/types/variants.types";

const schema = z.object({
  name: z.string().min(1, "Variant name is required").max(50),
  price: z.coerce.number().min(0, "Price must be 0 or more"),
  isDefault: z.boolean(),
  isAvailable: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

interface VariantFormProps {
  menuItemId: string;
  variant?: LocalVariant | null;
  onSave: (data: Omit<LocalVariant, "addonGroups" | "deleted">) => void;
  onClose: () => void;
}

export default function VariantForm({
  menuItemId,
  variant,
  onSave,
  onClose,
}: VariantFormProps) {

  const isEditing = variant != null;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: variant?.name ?? "",
      price: variant?.price ?? 0,
      isDefault: variant?.isDefault ?? false,
      isAvailable: variant?.isAvailable ?? true,
    },
  });

  function onSubmit(data: FormValues) {
    onSave({
      id: variant?.id ?? `temp_${Date.now()}`,
      menuItemId,
      sortOrder: variant?.sortOrder ?? 0,
      ...data,
    })
    onClose()
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <Controller
        name="name"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>
              Variant Name <span className="text-[#dc2626]">*</span>
            </FieldLabel>
            <Input
              {...field}
              id={field.name}
              placeholder="e.g. Regular, Small, Large"
              aria-invalid={fieldState.invalid}
              className="bg-white border-[#e5e7eb] h-10"
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name="price"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>
              Price (Rs.) <span className="text-[#dc2626]">*</span>
            </FieldLabel>
            <Input
              {...field}
              id={field.name}
              type="number"
              placeholder="450"
              aria-invalid={fieldState.invalid}
              className="bg-white border-[#e5e7eb] h-10"
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name="isDefault"
        control={form.control}
        render={({ field }) => (
          <Field orientation="horizontal">
            <div className="flex-1">
              <FieldLabel htmlFor={field.name}>Set as default</FieldLabel>
            </div>
            <Switch
              id={field.name}
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          </Field>
        )}
      />

      <Controller
        name="isAvailable"
        control={form.control}
        render={({ field }) => (
          <Field orientation="horizontal">
            <div className="flex-1">
              <FieldLabel htmlFor={field.name}>Available</FieldLabel>
            </div>
            <Switch
              id={field.name}
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          </Field>
        )}
      />

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="flex-1 border-[#e5e7eb] text-[#6b7280]"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="flex-1 bg-[#f97316] hover:bg-[#ea6c0a] text-white"
        >
          {isEditing ? "Update" : "Add"}
        </Button>
      </div>
    </form>
  );
}
