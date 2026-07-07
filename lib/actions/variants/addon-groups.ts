"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export async function createAddonGroup(data: {
  name: string
  isRequired: boolean
  isMultiple: boolean
  minSelections: number
  maxSelections: number | null
  variantId: string
}) {
  const session = await auth()
  if (!session) return { error: "Not authenticated" }

  const last = await prisma.addonGroup.findFirst({
    where: { variantId: data.variantId },
    orderBy: { sortOrder: "desc" },
  })

  await prisma.addonGroup.create({
    data: {
      name: data.name.trim(),
      isRequired: data.isRequired,
      isMultiple: data.isMultiple,
      minSelections: data.minSelections,
      maxSelections: data.maxSelections,
      sortOrder: (last?.sortOrder ?? 0) + 1,
      variantId: data.variantId,
    },
  })

  revalidatePath("/menu/variants")
  return { success: true, message: "Addon group created successfully" }
}

export async function updateAddonGroup(data: {
  id: string
  name: string
  isRequired: boolean
  isMultiple: boolean
  minSelections: number
  maxSelections: number | null
}) {
  const session = await auth()
  if (!session) return { error: "Not authenticated" }

  await prisma.addonGroup.update({
    where: { id: data.id },
    data: {
      name: data.name.trim(),
      isRequired: data.isRequired,
      isMultiple: data.isMultiple,
      minSelections: data.minSelections,
      maxSelections: data.maxSelections,
    },
  })

  revalidatePath("/menu/variants")
  return { success: true, message: "Addon group updated successfully" }
}

export async function deleteAddonGroup(id: string) {
  const session = await auth()
  if (!session) return { error: "Not authenticated" }

  await prisma.addonGroup.delete({ where: { id } })
  revalidatePath("/menu/variants")
  return { success: true, message: "Addon group deleted successfully" }
}