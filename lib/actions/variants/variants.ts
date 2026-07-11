"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { LocalVariant } from "@/types/variants.types"
import { Prisma } from "@prisma/client"

export async function saveItemVariants(data: {
  menuItemId: string
  variants: LocalVariant[]
}) {
  const session = await auth()
  if (!session) return { error: "Not authenticated" }

  // validate at least one default variant exists
  const hasDefault = data.variants
    .filter((v) => !v.deleted)
    .some((v) => v.isDefault)

  if (!hasDefault) {
    return { error: "At least one variant must be set as default" }
  }

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {

    for (const variant of data.variants) {
      const isNew = variant.id.startsWith("temp_")

      // ── deleted ──
      if (variant.deleted) {
        if (!isNew) {
          await tx.variant.delete({ where: { id: variant.id } })
        }
        continue
      }

      // ── create or update variant ──
      let variantId: string

      if (isNew) {
        const created = await tx.variant.create({
          data: {
            name: variant.name.trim(),
            price: variant.price,
            isDefault: variant.isDefault,
            isAvailable: variant.isAvailable,
            sortOrder: variant.sortOrder,
            menuItemId: data.menuItemId,
          },
        })
        variantId = created.id
      } else {
        await tx.variant.update({
          where: { id: variant.id },
          data: {
            name: variant.name.trim(),
            price: variant.price,
            isDefault: variant.isDefault,
            isAvailable: variant.isAvailable,
          },
        })
        variantId = variant.id
      }

      // ── addon groups ──
      for (const group of variant.addonGroups) {
        const isNewGroup = group.id.startsWith("temp_")

        if (group.deleted) {
          if (!isNewGroup) {
            await tx.addonGroup.delete({ where: { id: group.id } })
          }
          continue
        }

        let groupId: string

        if (isNewGroup) {
          const created = await tx.addonGroup.create({
            data: {
              name: group.name.trim(),
              isRequired: group.isRequired,
              isMultiple: group.isMultiple,
              minSelections: group.minSelections,
              maxSelections: group.maxSelections,
              sortOrder: group.sortOrder,
              variantId,
            },
          })
          groupId = created.id
        } else {
          await tx.addonGroup.update({
            where: { id: group.id },
            data: {
              name: group.name.trim(),
              isRequired: group.isRequired,
              isMultiple: group.isMultiple,
              minSelections: group.minSelections,
              maxSelections: group.maxSelections,
            },
          })
          groupId = group.id
        }

        // ── addons ──
        for (const addon of group.addons) {
          const isNewAddon = addon.id.startsWith("temp_")

          if (addon.deleted) {
            if (!isNewAddon) {
              await tx.addon.delete({ where: { id: addon.id } })
            }
            continue
          }

          if (isNewAddon) {
            await tx.addon.create({
              data: {
                name: addon.name.trim(),
                price: addon.price,
                isAvailable: addon.isAvailable,
                sortOrder: addon.sortOrder,
                addonGroupId: groupId,
              },
            })
          } else {
            await tx.addon.update({
              where: { id: addon.id },
              data: {
                name: addon.name.trim(),
                price: addon.price,
                isAvailable: addon.isAvailable,
              },
            })
          }
        }
      }
    }
  })

  revalidatePath("/menu/variants")
  return { success: true, message: "All changes saved successfully" }
}













































// ── Variant Actions ────────────────────────────────

export async function getVariants(menuItemId: string) {
  const session = await auth()
  if (!session) return []

  return await prisma.variant.findMany({
    where: { menuItemId },
    orderBy: { sortOrder: "asc" },
    include: {
      addonGroups: {
        orderBy: { sortOrder: "asc" },
        include: {
          addons: {
            orderBy: { sortOrder: "asc" },
          },
        },
      },
    },
  })
}

export async function createVariant(data: {
  name: string
  price: number
  isDefault: boolean
  isAvailable: boolean
  menuItemId: string
}) {
  const session = await auth()
  if (!session) return { error: "Not authenticated" }

  // if new variant is default, remove default from others
  if (data.isDefault) {
    await prisma.variant.updateMany({
      where: { menuItemId: data.menuItemId },
      data: { isDefault: false },
    })
  }

  const last = await prisma.variant.findFirst({
    where: { menuItemId: data.menuItemId },
    orderBy: { sortOrder: "desc" },
  })

  await prisma.variant.create({
    data: {
      name: data.name.trim(),
      price: data.price,
      isDefault: data.isDefault,
      isAvailable: data.isAvailable,
      sortOrder: (last?.sortOrder ?? 0) + 1,
      menuItemId: data.menuItemId,
    },
  })

  revalidatePath("/menu/variants")
  return { success: true, message: "Variant created successfully" }
}

export async function updateVariant(data: {
  id: string
  name: string
  price: number
  isDefault: boolean
  isAvailable: boolean
  menuItemId: string
}) {
  const session = await auth()
  if (!session) return { error: "Not authenticated" }

  if (data.isDefault) {
    await prisma.variant.updateMany({
      where: { menuItemId: data.menuItemId, NOT: { id: data.id } },
      data: { isDefault: false },
    })
  }

  await prisma.variant.update({
    where: { id: data.id },
    data: {
      name: data.name.trim(),
      price: data.price,
      isDefault: data.isDefault,
      isAvailable: data.isAvailable,
    },
  })

  revalidatePath("/menu/variants")
  return { success: true, message: "Variant updated successfully" }
}

export async function deleteVariant(id: string) {
  const session = await auth()
  if (!session) return { error: "Not authenticated" }

  const variant = await prisma.variant.findUnique({
    where: { id },
    include: { _count: { select: { addonGroups: true } } },
  })

  if (!variant) return { error: "Variant not found" }

  // check if it is the only variant
  const count = await prisma.variant.count({
    where: { menuItemId: variant.menuItemId },
  })

  if (count === 1) {
    return { error: "Cannot delete the only variant. Every item must have at least one variant." }
  }

  await prisma.variant.delete({ where: { id } })
  revalidatePath("/menu/variants")
  return { success: true, message: "Variant deleted successfully" }
}