"use client"

import { useState, useTransition } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { createAddon, updateAddon } from "@/lib/actions/variants/addons"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Addon } from "@/types/variants.types"

const schema = z.object({
  name: z.string().min(1, "Addon name is required").max(50),
  price: z.coerce.number().min(0),
  isAvailable: z.boolean(),
})

type FormValues = z.infer<typeof schema>

interface AddonFormProps {
  addonGroupId: string
  addon?: Addon | null
  onClose: () => void
}

export default function AddonForm({
  addonGroupId,
  addon,
  onClose,
}: AddonFormProps) {
  const isEditing = addon != null
  const [serverError, setServerError] = useState("")
  const [isPending, startTransition] = useTransition()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: addon?.name ?? "",
      price: addon?.price ?? 0,
      isAvailable: addon?.isAvailable ?? true,
    },
  })

  function onSubmit(data: FormValues) {
    setServerError("")
    startTransition(async () => {
      const result = isEditing
        ? await updateAddon({ id: addon.id, ...data })
        : await createAddon({ addonGroupId, ...data })

      if (result?.error) {
        setServerError(result.error)
        return
      }
      onClose()
    })
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

      <Controller
        name="name"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>
              Addon Name <span className="text-[#dc2626]">*</span>
            </FieldLabel>
            <Input
              {...field}
              id={field.name}
              placeholder="e.g. Extra cheese, Garlic sauce"
              aria-invalid={fieldState.invalid}
              className="bg-white border-[#e5e7eb] h-10"
            />
            {fieldState.invalid && (
              <FieldError errors={[fieldState.error]} />
            )}
          </Field>
        )}
      />

      <Controller
        name="price"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>
              Additional Price (Rs.)
            </FieldLabel>
            <Input
              {...field}
              id={field.name}
              type="number"
              placeholder="0"
              aria-invalid={fieldState.invalid}
              className="bg-white border-[#e5e7eb] h-10"
            />
            {fieldState.invalid && (
              <FieldError errors={[fieldState.error]} />
            )}
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

      {/* {serverError && <FormError message={serverError} />} */}

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
          disabled={isPending}
          className="flex-1 bg-[#f97316] hover:bg-[#ea6c0a] text-white"
        >
          {isPending
            ? isEditing ? "Saving..." : "Creating..."
            : isEditing ? "Save Changes" : "Create"
          }
        </Button>
      </div>

    </form>
  )
}