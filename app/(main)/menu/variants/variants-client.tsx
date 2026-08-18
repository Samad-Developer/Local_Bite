"use client";

import { useState, useTransition, useEffect } from "react";
import { toast } from "sonner";
import {
  Pencil,
  Trash2,
  Plus,
  UtensilsCrossed,
  Save,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppModal } from "@/components/shared/AppModal";
import PageHeader from "@/components/shared/PageHeader";
import { DeleteModal } from "@/components/shared/DeleteModal";
import VariantForm from "@/components/variants/variant-form";
import AddonGroupForm from "@/components/variants/addon-group-form";
import AddonForm from "@/components/variants/addon-form";
import { saveItemVariants } from "@/lib/actions/variants/variants";
import type {
  MenuItemWithVariants,
  LocalVariant,
  LocalAddonGroup,
  LocalAddon,
  ModalState,
  DeleteState
} from "@/types/variants.types";
import Image from "next/image";
import { Spinner } from "@/components/ui/spinner";

export default function VariantsClient({ menuItems }: { menuItems: MenuItemWithVariants[] }) {

  const [selectedItemId, setSelectedItemId] = useState<string | null>(menuItems[0]?.id ?? null);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<ModalState>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteState>(null);
  const [localItems, setLocalItems] = useState<MenuItemWithVariants[]>(menuItems);
  const [hasChanges, setHasChanges] = useState(false);
  const [isPending, startTransition] = useTransition();


  useEffect(() => {
    setLocalItems(menuItems);
    setHasChanges(false);
  }, [menuItems]);

  const selectedItem = localItems.find((item) => item.id === selectedItemId);
  const filteredItems = localItems.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()),
  );

  type updateFunction = (item: MenuItemWithVariants) => MenuItemWithVariants;

  function updateLocalItem(updater: updateFunction) {
    if (!selectedItemId) return;

    setLocalItems((prev) => prev.map((item) => (item.id === selectedItemId ? updater(item) : item)));
    setHasChanges(true);
  }

  function handleVariantSave(
    data: Omit<LocalVariant, "addonGroups" | "deleted">,
  ) {
    updateLocalItem((item) => {
      const exists = item.variants.find((v) => v.id === data.id);
      if (exists) {
        return {
          ...item,
          variants: item.variants.map((v) =>
            v.id === data.id ? { ...v, ...data } : v,
          ),
        };
      }
      return {
        ...item,
        variants: [...item.variants, { ...data, addonGroups: [] }],
      };
    });
  }

  function handleVariantDelete(variantId: string) {
    updateLocalItem((item) => ({
      ...item,
      variants: item.variants.map((v) =>
        v.id === variantId ? { ...v, deleted: true } : v,
      ),
    }));
    setDeleteTarget(null);
  }

  function handleGroupSave(data: Omit<LocalAddonGroup, "addons" | "deleted">) {
    updateLocalItem((item) => ({
      ...item,
      variants: item.variants.map((v) => {
        if (v.id !== data.variantId) return v;
        const exists = v.addonGroups.find((g) => g.id === data.id);
        if (exists) {
          return {
            ...v,
            addonGroups: v.addonGroups.map((g) =>
              g.id === data.id ? { ...g, ...data } : g,
            ),
          };
        }
        return {
          ...v,
          addonGroups: [...v.addonGroups, { ...data, addons: [] }],
        };
      }),
    }));
  }

  function handleGroupDelete(variantId: string, groupId: string) {
    updateLocalItem((item) => ({
      ...item,
      variants: item.variants.map((v) =>
        v.id !== variantId
          ? v
          : {
            ...v,
            addonGroups: v.addonGroups.map((g) =>
              g.id === groupId ? { ...g, deleted: true } : g,
            ),
          },
      ),
    }));
    setDeleteTarget(null);
  }

  function handleAddonSave(
    variantId: string,
    data: Omit<LocalAddon, "deleted">,
  ) {
    updateLocalItem((item) => ({
      ...item,
      variants: item.variants.map((v) =>
        v.id !== variantId
          ? v
          : {
            ...v,
            addonGroups: v.addonGroups.map((g) =>
              g.id !== data.addonGroupId
                ? g
                : {
                  ...g,
                  addons: (() => {
                    const exists = g.addons.find((a) => a.id === data.id);
                    if (exists) {
                      return g.addons.map((a) =>
                        a.id === data.id ? { ...a, ...data } : a,
                      );
                    }
                    return [...g.addons, data];
                  })(),
                },
            ),
          },
      ),
    }));
  }

  function handleAddonDelete(
    variantId: string,
    groupId: string,
    addonId: string,
  ) {
    updateLocalItem((item) => ({
      ...item,
      variants: item.variants.map((v) =>
        v.id !== variantId
          ? v
          : {
            ...v,
            addonGroups: v.addonGroups.map((g) =>
              g.id !== groupId
                ? g
                : {
                  ...g,
                  addons: g.addons.map((a) =>
                    a.id === addonId ? { ...a, deleted: true } : a,
                  ),
                },
            ),
          },
      ),
    }));
    setDeleteTarget(null);
  }

  function handleSaveAll() {
    if (!selectedItem) return;
    startTransition(async () => {
      const result = await saveItemVariants({
        menuItemId: selectedItem.id,
        variants: selectedItem.variants,
      });

      if (result?.error) {
        toast.error(result.error, { position: "top-center" });
      } else {
        toast.success(result.message, { position: "top-center" });
        setHasChanges(false);
      }
    });
  }

  function handleDiscard() {
    setLocalItems(menuItems);
    setHasChanges(false);
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return;
    if (deleteTarget.type === "variant") {
      handleVariantDelete(deleteTarget.variantId);
    } else if (deleteTarget.type === "addongroup") {
      handleGroupDelete(deleteTarget.variantId, deleteTarget.groupId);
    } else {
      handleAddonDelete(
        deleteTarget.variantId,
        deleteTarget.groupId,
        deleteTarget.addonId,
      );
    }
  }

  function getModalTitle() {
    if (!modal) return "";
    const titles: Record<string, string> = {
      "variant-create": "Add Variant",
      "variant-edit": "Edit Variant",
      "addongroup-create": "Add Addon Group",
      "addongroup-edit": "Edit Addon Group",
      "addon-create": "Add Addon",
      "addon-edit": "Edit Addon",
    };
    return titles[modal.type] ?? "";
  }

  function renderModalContent() {
    if (!modal || !selectedItem) return null;

    switch (modal.type) {
      case "variant-create":
        return (
          <VariantForm
            menuItemId={selectedItem.id}
            onSave={handleVariantSave}
            onClose={() => setModal(null)}
          />
        );
      case "variant-edit":
        return (
          <VariantForm
            menuItemId={selectedItem.id}
            variant={modal.variant}
            onSave={handleVariantSave}
            onClose={() => setModal(null)}
          />
        );
      case "addongroup-create":
        return (
          <AddonGroupForm
            variantId={modal.variantId}
            onSave={handleGroupSave}
            onClose={() => setModal(null)}
          />
        );
      case "addongroup-edit":
        return (
          <AddonGroupForm
            variantId={modal.group.variantId}
            group={modal.group}
            onSave={handleGroupSave}
            onClose={() => setModal(null)}
          />
        );
      case "addon-create":
        return (
          <AddonForm
            addonGroupId={modal.addonGroupId}
            onSave={(data) => {
              handleAddonSave(modal.variantId, data);
              setModal(null);
            }}
            onClose={() => setModal(null)}
          />
        );
      case "addon-edit":
        return (
          <AddonForm
            addonGroupId={modal.addon.addonGroupId}
            addon={modal.addon}
            onSave={(data) => {
              handleAddonSave(modal.variantId, data);
              setModal(null);
            }}
            onClose={() => setModal(null)}
          />
        );
    }
  }

  const activeVariants = selectedItem?.variants.filter((v) => !v.deleted) ?? [];

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Variants & Addons"
        isAddNewButtonVisible={false}
        buttonLabel="Add Variant"
        onButtonClick={() => {
          if (selectedItemId) setModal({ type: "variant-create" });
        }}
      />

      <div className="flex gap-0 border border-[#e5e7eb] rounded-xl overflow-hidden bg-white flex-1 min-h-150">

        <div className="w-60 border-r border-[#e5e7eb] flex flex-col shrink-0">
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
            {filteredItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  if (hasChanges) {
                    const confirm = window.confirm(
                      "You have unsaved changes. Discard them?",
                    );
                    if (!confirm) return;
                    handleDiscard();
                  }
                  setSelectedItemId(item.id);
                }}
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
                  <p
                    className={`text-xs font-medium ${selectedItemId === item.id
                      ? "text-[#f97316]"
                      : "text-[#111111]"
                      }`}
                  >
                    {item.name}
                  </p>
                  <p className="text-xs text-[#9ca3af]">{item.category.name}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden bg-[#f9fafb]">

          {!selectedItem ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-[#9ca3af]">
                Select a menu item to manage its variants
              </p>
            </div>
          ) : (
            <>
              <div className="px-5 py-3 border-b border-[#e5e7eb] bg-white flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[#111111]">
                    {selectedItem.name}
                  </p>
                  <p className="text-xs text-[#6b7280] mt-0.5">
                    {activeVariants.length}{" "}
                    {activeVariants.length === 1 ? "variant" : "variants"}
                    {hasChanges && (
                      <span className="ml-2 text-[#f97316] font-medium">
                        · Unsaved changes
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {hasChanges && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleDiscard}
                      className="h-8 text-xs border-[#e5e7eb] text-[#6b7280]"
                    >
                      <RotateCcw className="w-3.5 h-3.5 mr-1" />
                      Discard
                    </Button>
                  )}
                  <Button
                    size="sm"
                    onClick={handleSaveAll}
                    disabled={!hasChanges || isPending}
                    className={`h-8 text-xs ${hasChanges
                      ? "bg-[#16a34a] hover:bg-[#15803d] text-white"
                      : "bg-[#f3f4f6] text-[#9ca3af] cursor-not-allowed"
                      }`}
                  >
                    {isPending ? <Spinner/> : <Save className="w-3.5 h-3.5 mr-1" />}
                    {isPending ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setModal({ type: "variant-create" })}
                    className="bg-[#f97316] hover:bg-[#ea6c0a] text-white h-8 text-xs"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Add Variant
                  </Button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {activeVariants.length === 0 && (
                  <div className="text-center py-10">
                    <p className="text-sm text-[#9ca3af]">No variants yet</p>
                  </div>
                )}

                {activeVariants.map((variant) => {
                  const activeGroups = variant.addonGroups.filter(
                    (g) => !g.deleted,
                  );

                  return (
                    <div
                      key={variant.id}
                      className="bg-white border border-[#e5e7eb] rounded-xl overflow-hidden"
                    >
                      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-[#f3f4f6]">
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
                        {variant.id.startsWith("temp_") && (
                          <span className="text-xs bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe] px-2 py-0.5 rounded-full">
                            New
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
                              setModal({ type: "variant-edit", variant })
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
                                variantId: variant.id,
                                name: variant.name,
                              })
                            }
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>

                      <div className="px-4 py-3 bg-[#fafafa]">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-semibold uppercase tracking-wider text-[#9ca3af]">
                            Addon Groups
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

                        {activeGroups.length === 0 && (
                          <p className="text-xs text-[#9ca3af] py-1">
                            No addon groups yet
                          </p>
                        )}

                        <div className="space-y-2">
                          {activeGroups.map((group) => {
                            const activeAddons = group.addons.filter(
                              (a) => !a.deleted,
                            );
                            return (
                              <div
                                key={group.id}
                                className="bg-white border border-[#e5e7eb] rounded-lg overflow-hidden"
                              >
                                <div className="flex items-center gap-2 px-3 py-2 border-b border-[#f3f4f6]">
                                  <span className="text-xs font-medium text-[#111111] flex-1">
                                    {group.name}
                                  </span>
                                  {group.id.startsWith("temp_") && (
                                    <span className="text-xs bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe] px-1.5 py-0.5 rounded-full">
                                      New
                                    </span>
                                  )}
                                  <span
                                    className={`
                                    text-xs px-1.5 py-0.5 rounded-full
                                    ${group.isRequired
                                        ? "bg-[#fef2f2] text-[#dc2626] border border-[#fecaca]"
                                        : "bg-[#f9fafb] text-[#6b7280] border border-[#e5e7eb]"
                                      }
                                  `}
                                  >
                                    {group.isRequired ? "Required" : "Optional"}
                                    {" · "}
                                    {group.isMultiple
                                      ? "pick many"
                                      : "pick one"}
                                    {group.maxSelections
                                      ? ` · max ${group.maxSelections}`
                                      : ""}
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
                                          variantId: variant.id,
                                          groupId: group.id,
                                          name: group.name,
                                        })
                                      }
                                      className="w-6 h-6 rounded border border-[#e5e7eb] flex items-center justify-center text-[#9ca3af] hover:text-[#dc2626]"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>

                                <div>
                                  {activeAddons.map((addon) => (
                                    <div
                                      key={addon.id}
                                      className="flex items-center gap-2 px-3 py-1.5 border-b border-[#f9fafb] last:border-0"
                                    >
                                      <span className="text-xs text-[#111111] flex-1">
                                        {addon.name}
                                      </span>
                                      {addon.id.startsWith("temp_") && (
                                        <span className="text-xs text-[#2563eb]">
                                          New
                                        </span>
                                      )}
                                      {!addon.isAvailable && (
                                        <span className="text-xs text-[#9ca3af]">
                                          Unavailable
                                        </span>
                                      )}
                                      <span className="text-xs font-medium text-[#f97316]">
                                        {addon.price > 0
                                          ? `+ Rs. ${addon.price}`
                                          : "Free"}
                                      </span>
                                      <div className="flex gap-1">
                                        <button
                                          onClick={() =>
                                            setModal({
                                              type: "addon-edit",
                                              addon,
                                              variantId: variant.id,
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
                                              variantId: variant.id,
                                              groupId: group.id,
                                              addonId: addon.id,
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
                                  <button
                                    onClick={() =>
                                      setModal({
                                        type: "addon-create",
                                        addonGroupId: group.id,
                                        variantId: variant.id,
                                      })
                                    }
                                    className="w-full flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#f97316] hover:bg-[#fff7ed] transition-colors"
                                  >
                                    <Plus className="w-3 h-3" />
                                    Add addon
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      <AppModal
        open={modal !== null}
        onClose={() => setModal(null)}
        title={getModalTitle()}
        size="sm"
        isEditing={false}
        isPending={false}
        isFooter={false}
      >
        {renderModalContent()}
      </AppModal>

      <DeleteModal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title={`Remove ${deleteTarget?.type === "variant"
          ? "Variant"
          : deleteTarget?.type === "addongroup"
            ? "Addon Group"
            : "Addon"
          }`}
        isPending={false}
      />
    </div>
  );
}
