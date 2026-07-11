"use client";

import { useState, useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  createAddonGroup,
  updateAddonGroup,
} from "@/lib/actions/variants/addon-groups";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldDescription,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import type { LocalAddonGroup } from "@/types/variants.types";

const schema = z.object({
  name: z.string().min(1, "Group name is required").max(50),
  isRequired: z.boolean(),
  isMultiple: z.boolean(),
  minSelections: z.coerce.number().min(0),
  maxSelections: z.coerce.number().min(0).nullable(),
});

type FormValues = z.infer<typeof schema>;

interface AddonGroupFormProps {
  variantId: string;
  group?: LocalAddonGroup | null;
  onSave: (data: Omit<LocalAddonGroup, "addons" | "deleted">) => void;
  onClose: () => void;
}

export default function AddonGroupForm({
  variantId,
  group,
  onSave,
  onClose,
}: AddonGroupFormProps) {
  const isEditing = group != null;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: group?.name ?? "",
      isRequired: group?.isRequired ?? false,
      isMultiple: group?.isMultiple ?? true,
      minSelections: group?.minSelections ?? 0,
      maxSelections: group?.maxSelections ?? null,
    },
  });

  function onSubmit(data: FormValues) {
    onSave({
      id: group?.id ?? `temp_${Date.now()}`,
      variantId,
      sortOrder: group?.sortOrder ?? 0,
      ...data,
    });
    onClose();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <Controller
        name="name"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>
              Group Name <span className="text-[#dc2626]">*</span>
            </FieldLabel>
            <Input
              {...field}
              id={field.name}
              placeholder="e.g. Extras, Toppings, Sauce"
              aria-invalid={fieldState.invalid}
              className="bg-white border-[#e5e7eb] h-10"
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name="isRequired"
        control={form.control}
        render={({ field }) => (
          <Field orientation="horizontal">
            <div className="flex-1">
              <FieldLabel htmlFor={field.name}>Required</FieldLabel>
              <FieldDescription>
                Customer must choose at least one
              </FieldDescription>
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
        name="isMultiple"
        control={form.control}
        render={({ field }) => (
          <Field orientation="horizontal">
            <div className="flex-1">
              <FieldLabel htmlFor={field.name}>Allow multiple</FieldLabel>
              <FieldDescription>
                Customer can pick more than one
              </FieldDescription>
            </div>
            <Switch
              id={field.name}
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          </Field>
        )}
      />

      <div className="grid grid-cols-2 gap-3">
        <Controller
          name="minSelections"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Min selections</FieldLabel>
              <Input
                {...field}
                id={field.name}
                type="number"
                placeholder="0"
                aria-invalid={fieldState.invalid}
                className="bg-white border-[#e5e7eb] h-10"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="maxSelections"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="maxSelections">Max selections</FieldLabel>
              <Input
                id="maxSelections"
                type="number"
                placeholder="Unlimited"
                value={field.value ?? ""}
                onChange={(e) =>
                  field.onChange(
                    e.target.value === "" ? null : Number(e.target.value),
                  )
                }
                aria-invalid={fieldState.invalid}
                className="bg-white border-[#e5e7eb] h-10"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>

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
