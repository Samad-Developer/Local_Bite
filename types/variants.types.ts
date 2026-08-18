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

export type LocalAddon = {
  id: string
  name: string
  price: number
  isAvailable: boolean
  sortOrder: number
  addonGroupId: string
  deleted?: boolean
}

export type LocalAddonGroup = {
  id: string
  name: string
  isRequired: boolean
  isMultiple: boolean
  minSelections: number
  maxSelections: number | null
  sortOrder: number
  variantId: string
  addons: LocalAddon[]
  deleted?: boolean
}

export type LocalVariant = {
  id: string
  name: string
  price: number
  isDefault: boolean
  isAvailable: boolean
  sortOrder: number
  menuItemId: string
  addonGroups: LocalAddonGroup[]
  deleted?: boolean
}

export type MenuItemWithVariants = {
  id: string
  name: string
  category: { id: string; name: string }
  images: { url: string }[]
  variants: LocalVariant[]
}

export type ModalState =
  | { type: "variant-create" }
  | { type: "variant-edit"; variant: LocalVariant }
  | { type: "addongroup-create"; variantId: string }
  | { type: "addongroup-edit"; group: LocalAddonGroup }
  | { type: "addon-create"; addonGroupId: string; variantId: string }
  | { type: "addon-edit"; addon: LocalAddon; variantId: string }
  | null;

export type DeleteState =
  | { type: "variant"; variantId: string; name: string }
  | { type: "addongroup"; variantId: string; groupId: string; name: string }
  | {
      type: "addon";
      variantId: string;
      groupId: string;
      addonId: string;
      name: string;
    }
  | null;
