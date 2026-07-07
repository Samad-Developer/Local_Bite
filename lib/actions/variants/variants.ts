"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

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