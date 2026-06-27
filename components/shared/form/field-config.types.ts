// ─────────────────────────────────────────────────────────────
// FieldConfig — the shape of one field in a form config array.
// Add more variants here as your field types grow.
// ─────────────────────────────────────────────────────────────

export type FieldConfig =
  | TextFieldConfig
  | NumberFieldConfig
  | EmailFieldConfig
  | TextareaFieldConfig
  | SelectFieldConfig
  | SwitchFieldConfig

interface BaseField {
  name: string
  label: string
  description?: string  // optional helper text below the field
  className?: string
}

export interface TextFieldConfig extends BaseField {
  type: "text"
  placeholder?: string
}

export interface NumberFieldConfig extends BaseField {
  type: "number"
  placeholder?: string
  min?: number
  max?: number
}

export interface EmailFieldConfig extends BaseField {
  type: "email"
  placeholder?: string
}

export interface TextareaFieldConfig extends BaseField {
  type: "textarea"
  placeholder?: string
  rows?: number
}

export interface SelectFieldConfig extends BaseField {
  type: "select"
  options: { value: string; label: string }[]
  placeholder?: string
}

export interface SwitchFieldConfig extends BaseField {
  type: "switch"
}