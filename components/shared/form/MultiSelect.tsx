"use client"

import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox"
import { FieldConfig } from "./field-config.types";
import React from "react";

// ─────────────────────────────────────────────────────────────
// MultiSelectField
//
// Wraps the Combobox (multiple mode) for use inside FormRenderer.
// Needs to be its own component because useComboboxAnchor is a
// hook and can't run conditionally inside the Controller's
// render callback.
// ─────────────────────────────────────────────────────────────
export default function MultiSelectField({
  field,
  config,
  invalid,
}: {
  field: { value: any; onChange: (val: any) => void; name: string }
  config: FieldConfig & { type: "multi-select" }
  invalid: boolean
}) {
  const anchor = useComboboxAnchor()

  return (
    <Combobox
      multiple
      autoHighlight
      items={config.options.map((opt) => opt.value)}
      value={field.value ?? []}
      onValueChange={field.onChange}
    >
      <ComboboxChips ref={anchor} className="w-full" aria-invalid={invalid}>
        <ComboboxValue>
          {(values: string[]) => (
            <React.Fragment>
              {values.map((value) => (
                <ComboboxChip key={value}>
                  {config.options.find((o) => o.value === value)?.label ?? value}
                </ComboboxChip>
              ))}
              <ComboboxChipsInput
                id={field.name}
                placeholder={
                  (field.value?.length ?? 0) === 0
                    ? config.placeholder ?? `Select ${config.label}`
                    : undefined
                }
              />
            </React.Fragment>
          )}
        </ComboboxValue>
      </ComboboxChips>
      <ComboboxContent anchor={anchor}>
        <ComboboxEmpty>No items found.</ComboboxEmpty>
        <ComboboxList>
          {(item: string) => (
            <ComboboxItem key={item} value={item}>
              {config.options.find((o) => o.value === item)?.label ?? item}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}



