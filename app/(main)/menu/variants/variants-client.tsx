"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Pencil, Trash2, Plus, UtensilsCrossed } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AppModal } from "@/components/shared/AppModal"
import PageHeader from "@/components/shared/PageHeader"
import { DeleteModal } from "@/components/shared/DeleteModal"
import VariantForm from "@/components/variants/variant-form"
import AddonGroupForm from "@/components/variants/addon-group-form"
import AddonForm from "@/components/variants/addon-form"
import { deleteVariant } from "@/lib/actions/variants/variants"
import { deleteAddonGroup } from "@/lib/actions/variants/addon-groups"
import { deleteAddon } from "@/lib/actions/variants/addons"
import type {
  MenuItemWithVariants,
  Variant,
  AddonGroup,
  Addon,
} from "@/types/variants.types"
import Image from "next/image"

interface VariantsClientProps {
  menuItems: MenuItemWithVariants[]
}

type ModalState =
  | { type: "variant-create"; menuItemId: string }
  | { type: "variant-edit"; variant: Variant; menuItemId: string }
  | { type: "addongroup-create"; variantId: string }
  | { type: "addongroup-edit"; group: AddonGroup }
  | { type: "addon-create"; addonGroupId: string }
  | { type: "addon-edit"; addon: Addon }
  | null

type DeleteState =
  | { type: "variant"; id: string; name: string }
  | { type: "addongroup"; id: string; name: string }
  | { type: "addon"; id: string; name: string }
  | null

export default function VariantsClient({ menuItems }: VariantsClientProps) {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(
    menuItems[0]?.id ?? null
  )
  const [search, setSearch] = useState("")
  const [modal, setModal] = useState<ModalState>(null)
  const [deleteTarget, setDeleteTarget] = useState<DeleteState>(null)
  const [isPending, startTransition] = useTransition()

  const selectedItem = menuItems.find((item) => item.id === selectedItemId)

  const filteredItems = menuItems.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  )

  // ── Delete handlers ──────────────────────────────

  function handleDeleteConfirm() {
    if (!deleteTarget) return
    startTransition(async () => {
      let result
      if (deleteTarget.type === "variant") {
        result = await deleteVariant(deleteTarget.id)
      } else if (deleteTarget.type === "addongroup") {
        result = await deleteAddonGroup(deleteTarget.id)
      } else {
        result = await deleteAddon(deleteTarget.id)
      }

      if (result?.error) {
        toast.error(result.error, { position: "top-center" })
      } else {
        toast.success(result.message, { position: "top-center" })
        setDeleteTarget(null)
      }
    })
  }

  // ── Modal title helper ───────────────────────────

  function getModalTitle() {
    if (!modal) return ""
    switch (modal.type) {
      case "variant-create": return "Add Variant"
      case "variant-edit": return "Edit Variant"
      case "addongroup-create": return "Add Addon Group"
      case "addongroup-edit": return "Edit Addon Group"
      case "addon-create": return "Add Addon"
      case "addon-edit": return "Edit Addon"
    }
  }

  // ── Modal content ────────────────────────────────

  function renderModalContent() {
    if (!modal) return null
    switch (modal.type) {
      case "variant-create":
        return (
          <VariantForm
            menuItemId={modal.menuItemId}
            onClose={() => setModal(null)}
          />
        )
      case "variant-edit":
        return (
          <VariantForm
            menuItemId={modal.menuItemId}
            variant={modal.variant}
            onClose={() => setModal(null)}
          />
        )
      case "addongroup-create":
        return (
          <AddonGroupForm
            variantId={modal.variantId}
            onClose={() => setModal(null)}
          />
        )
      case "addongroup-edit":
        return (
          <AddonGroupForm
            variantId={modal.group.variantId}
            group={modal.group}
            onClose={() => setModal(null)}
          />
        )
      case "addon-create":
        return (
          <AddonForm
            addonGroupId={modal.addonGroupId}
            onClose={() => setModal(null)}
          />
        )
      case "addon-edit":
        return (
          <AddonForm
            addonGroupId={modal.addon.addonGroupId}
            addon={modal.addon}
            onClose={() => setModal(null)}
          />
        )
    }
  }

  return (
    <div className="flex flex-col h-full">

      <PageHeader
        title="Variants & Addons"
        buttonLabel="Add Variant"
        isAddNewButtonVisible={false}
        onButtonClick={() => {
          if (selectedItemId) {
            setModal({ type: "variant-create", menuItemId: selectedItemId })
          }
        }}
      />

      <div className="flex gap-0 border border-[#e5e7eb] rounded-xl overflow-hidden bg-white flex-1 min-h-[600px]">

        {/* ── Left Panel ── */}
        <div className="w-60 border-r border-[#e5e7eb] flex flex-col flex-shrink-0">
          <div className="p-3 border-b border-[#e5e7eb]">
            <p className="text-sm font-medium text-[#111111]">Menu Items</p>
            <p className="text-xs text-[#6b7280] mt-0.5">
              Select to manage variants
            </p>
          </div>
          <div className="p-2 border-b border-[#e5e7eb]">
            <Input
              placeholder="Search items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 text-xs bg-[#f9fafb] border-[#e5e7eb]"
            />
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredItems.length === 0 && (
              <p className="text-xs text-[#9ca3af] p-4 text-center">
                No items found
              </p>
            )}
            {filteredItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedItemId(item.id)}
                className={`
                  w-full text-left px-3 py-2.5 border-b border-[#f3f4f6]
                  flex items-center gap-2.5 transition-colors duration-150
                  ${selectedItemId === item.id
                    ? "bg-[#fff7ed] border-l-2 border-l-[#f97316] pl-2.5"
                    : "hover:bg-[#f9f9f9]"
                  }
                `}
              >
                <div className="w-8 h-8 rounded-lg overflow-hidden border border-[#e5e7eb] bg-[#f9fafb] flex-shrink-0 flex items-center justify-center">
                  {item.images[0] ? (
                    <Image
                      src={item.images[0].url}
                      alt={item.name}
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UtensilsCrossed className="w-3.5 h-3.5 text-[#d1d5db]" />
                  )}
                </div>
                <div>
                  <p className={`
                    text-xs font-medium
                    ${selectedItemId === item.id
                      ? "text-[#f97316]"
                      : "text-[#111111]"
                    }
                  `}>
                    {item.name}
                  </p>
                  <p className="text-xs text-[#9ca3af]">
                    {item.category.name}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Right Panel ── */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#f9fafb]">
          {!selectedItem ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <UtensilsCrossed className="w-10 h-10 text-[#d1d5db] mx-auto mb-3" />
                <p className="text-sm text-[#9ca3af]">
                  Select a menu item to manage its variants
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Right header */}
              <div className="px-5 py-3.5 border-b border-[#e5e7eb] bg-white flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#111111]">
                    {selectedItem.name}
                  </p>
                  <p className="text-xs text-[#6b7280] mt-0.5">
                    {selectedItem.variants.length}{" "}
                    {selectedItem.variants.length === 1
                      ? "variant"
                      : "variants"
                    }
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() =>
                    setModal({
                      type: "variant-create",
                      menuItemId: selectedItem.id,
                    })
                  }
                  className="bg-[#f97316] hover:bg-[#ea6c0a] text-white h-8 text-xs"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Add Variant
                </Button>
              </div>

              {/* Variants list */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">

                {selectedItem.variants.length === 0 && (
                  <div className="text-center py-10">
                    <p className="text-sm text-[#9ca3af]">
                      No variants yet
                    </p>
                  </div>
                )}

                {selectedItem.variants.map((variant) => (
                  <div
                    key={variant.id}
                    className="bg-white border border-[#e5e7eb] rounded-xl overflow-hidden"
                  >
                    {/* Variant header */}
                    <div className="flex items-center gap-2.5 px-4 py-3 bg-white border-b border-[#f3f4f6]">
                      <span className="text-sm font-medium text-[#111111] flex-1">
                        {variant.name}
                      </span>
                      {variant.isDefault && (
                        <span className="text-xs bg-[#f0fdf4] text-[#16a34a] border border-[#bbf7d0] px-2 py-0.5 rounded-full">
                          Default
                        </span>
                      )}
                      {!variant.isAvailable && (
                        <span className="text-xs bg-[#fef2f2] text-[#dc2626] border border-[#fecaca] px-2 py-0.5 rounded-full">
                          Unavailable
                        </span>
                      )}
                      <span className="text-sm font-semibold text-[#f97316]">
                        Rs. {variant.price.toLocaleString()}
                      </span>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-7 h-7 text-[#9ca3af] hover:text-[#111111]"
                          onClick={() =>
                            setModal({
                              type: "variant-edit",
                              variant,
                              menuItemId: selectedItem.id,
                            })
                          }
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-7 h-7 text-[#9ca3af] hover:text-[#dc2626] hover:bg-[#fef2f2]"
                          onClick={() =>
                            setDeleteTarget({
                              type: "variant",
                              id: variant.id,
                              name: variant.name,
                            })
                          }
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>

                    {/* Addon groups */}
                    <div className="px-4 py-3 bg-[#fafafa]">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold uppercase tracking-wider text-[#9ca3af]">
                          Addon groups
                        </p>
                        <button
                          onClick={() =>
                            setModal({
                              type: "addongroup-create",
                              variantId: variant.id,
                            })
                          }
                          className="text-xs text-[#f97316] hover:text-[#ea6c0a] flex items-center gap-1 border border-dashed border-[#fed7aa] px-2 py-0.5 rounded"
                        >
                          <Plus className="w-3 h-3" />
                          Add group
                        </button>
                      </div>

                      {variant.addonGroups.length === 0 && (
                        <p className="text-xs text-[#9ca3af] py-1">
                          No addon groups yet
                        </p>
                      )}

                      <div className="space-y-2">
                        {variant.addonGroups.map((group) => (
                          <div
                            key={group.id}
                            className="bg-white border border-[#e5e7eb] rounded-lg overflow-hidden"
                          >
                            {/* Group header */}
                            <div className="flex items-center gap-2 px-3 py-2 border-b border-[#f3f4f6]">
                              <span className="text-xs font-medium text-[#111111] flex-1">
                                {group.name}
                              </span>
                              <span className={`
                                text-xs px-1.5 py-0.5 rounded-full
                                ${group.isRequired
                                  ? "bg-[#fef2f2] text-[#dc2626] border border-[#fecaca]"
                                  : "bg-[#f9fafb] text-[#6b7280] border border-[#e5e7eb]"
                                }`}>
                                {group.isRequired ? "Required" : "Optional"}
                                {" · "}
                                {group.isMultiple ? "pick many" : "pick one"}
                                {group.maxSelections ? ` · max ${group.maxSelections}` : ""}
                              </span>
                              <div className="flex gap-1">
                                <button
                                  onClick={() =>
                                    setModal({
                                      type: "addongroup-edit",
                                      group,
                                    })
                                  }
                                  className="w-6 h-6 rounded border border-[#e5e7eb] flex items-center justify-center text-[#9ca3af] hover:text-[#111111]"
                                >
                                  <Pencil className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() =>
                                    setDeleteTarget({
                                      type: "addongroup",
                                      id: group.id,
                                      name: group.name,
                                    })
                                  }
                                  className="w-6 h-6 rounded border border-[#e5e7eb] flex items-center justify-center text-[#9ca3af] hover:text-[#dc2626]"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            {/* Addons */}
                            <div>
                              {group.addons.map((addon) => (
                                <div
                                  key={addon.id}
                                  className="flex items-center gap-2 px-3 py-1.5 border-b border-[#f9fafb] last:border-0"
                                >
                                  <span className="text-xs text-[#111111] flex-1">
                                    {addon.name}
                                  </span>
                                  {!addon.isAvailable && (
                                    <span className="text-xs text-[#9ca3af]">
                                      Unavailable
                                    </span>
                                  )}
                                  <span className="text-xs font-medium text-[#f97316]">
                                    {addon.price > 0
                                      ? `+ Rs. ${addon.price}`
                                      : "Free"
                                    }
                                  </span>
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() =>
                                        setModal({
                                          type: "addon-edit",
                                          addon,
                                        })
                                      }
                                      className="w-5 h-5 rounded border border-[#e5e7eb] flex items-center justify-center text-[#9ca3af] hover:text-[#111111]"
                                    >
                                      <Pencil className="w-2.5 h-2.5" />
                                    </button>
                                    <button
                                      onClick={() =>
                                        setDeleteTarget({
                                          type: "addon",
                                          id: addon.id,
                                          name: addon.name,
                                        })
                                      }
                                      className="w-5 h-5 rounded border border-[#e5e7eb] flex items-center justify-center text-[#9ca3af] hover:text-[#dc2626]"
                                    >
                                      <Trash2 className="w-2.5 h-2.5" />
                                    </button>
                                  </div>
                                </div>
                              ))}

                              {/* Add addon inline */}
                              <button
                                onClick={() =>
                                  setModal({
                                    type: "addon-create",
                                    addonGroupId: group.id,
                                  })
                                }
                                className="w-full flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#f97316] hover:bg-[#fff7ed] transition-colors cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                                Add addon
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Create / Edit Modal */}
      <AppModal
        open={modal !== null}
        onClose={() => setModal(null)}
        title={getModalTitle()}
        size="sm"
        formId="varaintsform"
        isEditing={false}
        isPending={false}
      >
        {renderModalContent()}
      </AppModal>

      {/* Delete Confirmation */}
      <DeleteModal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title={`Delete ${deleteTarget?.type === "variant"
          ? "Variant"
          : deleteTarget?.type === "addongroup"
          ? "Addon Group"
          : "Addon"
        }`}
        isPending={isPending}
      />
    </div>
  )
}