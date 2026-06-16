import { Control } from "react-hook-form"
import { Controller } from "react-hook-form"
import { FieldConfig } from "./field-config.types"

// shadcn/ui + your project's field components
import { Field, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface FormRendererProps {
  fields: FieldConfig[]
  control: Control<any>
  className?: string
}

// ─────────────────────────────────────────────────────────────
// FormRenderer
//
// Receives a fields config array + RHF control object.
// Renders the correct shadcn field component for each type.
// Handles label, description, error display automatically.
//
// Usage:
//   <FormRenderer fields={categoryFields} control={form.control} />
// ─────────────────────────────────────────────────────────────

export function FormRenderer({ fields, control, className }: FormRendererProps) {
  return (
    <div className={`flex flex-col gap-5 ${className ?? ""}`}>
      {fields.map((field) => (
        <Controller
          key={field.name}
          name={field.name}
          control={control}
          render={({ field: f, fieldState }) => {

            // ── Select ──────────────────────────────────────
            if (field.type === "select") {
              return (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={f.name}>{field.label}</FieldLabel>
                  <Select
                    name={f.name}
                    value={f.value ?? ""}
                    onValueChange={f.onChange}
                  >
                    <SelectTrigger
                      id={f.name}
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue
                        placeholder={field.placeholder ?? `Select ${field.label}`}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {field.description && (
                    <FieldDescription>{field.description}</FieldDescription>
                  )}
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )
            }

            // ── Textarea ────────────────────────────────────
            if (field.type === "textarea") {
              return (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={f.name}>{field.label}</FieldLabel>
                  <Textarea
                    {...f}
                    id={f.name}
                    aria-invalid={fieldState.invalid}
                    placeholder={field.placeholder}
                    rows={field.rows ?? 3}
                  />
                  {field.description && (
                    <FieldDescription>{field.description}</FieldDescription>
                  )}
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )
            }

            // ── Switch ──────────────────────────────────────
            if (field.type === "switch") {
              return (
                <Field orientation="horizontal" data-invalid={fieldState.invalid}>
                  <div className="flex flex-col gap-1">
                    <FieldLabel htmlFor={f.name}>{field.label}</FieldLabel>
                    {field.description && (
                      <FieldDescription>{field.description}</FieldDescription>
                    )}
                  </div>
                  <Switch
                    id={f.name}
                    name={f.name}
                    checked={!!f.value}
                    onCheckedChange={f.onChange}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )
            }

            // ── Text / Number / Email (default) ─────────────
            return (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={f.name}>{field.label}</FieldLabel>
                <Input
                  {...f}
                  id={f.name}
                  type={field.type}
                  placeholder={"placeholder" in field ? field.placeholder : undefined}
                  aria-invalid={fieldState.invalid}
                  // Convert string → number for number inputs so Zod gets the right type
                  onChange={(e) =>
                    f.onChange(
                      field.type === "number"
                        ? e.target.value === ""
                          ? ""
                          : Number(e.target.value)
                        : e.target.value
                    )
                  }
                />
                {field.description && (
                  <FieldDescription>{field.description}</FieldDescription>
                )}
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )
          }}
        />
      ))}
    </div>
  )
}