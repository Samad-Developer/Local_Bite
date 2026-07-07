export type Addon = {
  id: string
  name: string
  price: number
  isAvailable: boolean
  sortOrder: number
  addonGroupId: string
}

export type AddonGroup = {
  id: string
  name: string
  isRequired: boolean
  isMultiple: boolean
  minSelections: number
  maxSelections: number | null
  sortOrder: number
  variantId: string
  addons: Addon[]
}

export type Variant = {
  id: string
  name: string
  price: number
  isDefault: boolean
  isAvailable: boolean
  sortOrder: number
  menuItemId: string
  addonGroups: AddonGroup[]
}

export type MenuItemWithVariants = {
  id: string
  name: string
  category: { id: string; name: string }
  images: { url: string }[]
  variants: Variant[]
}