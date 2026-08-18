export type FieldConfig =
  | TextFieldConfig
  | NumberFieldConfig
  | EmailFieldConfig
  | TextareaFieldConfig
  | SelectFieldConfig
  | SwitchFieldConfig
  | DateFieldConfig
  | MultiSelectFieldConfig

interface BaseField {
  name: string
  label: string
  description?: string
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

export interface DateFieldConfig extends BaseField {
  type: "date"
  placeholder?: string
}

export interface MultiSelectFieldConfig extends BaseField {
  type: "multi-select"
  options: { value: string; label: string }[]
  placeholder?: string
}
