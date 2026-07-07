"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export async function createAddon(data: {
  name: string
  price: number
  isAvailable: boolean
  addonGroupId: string
}) {
  const session = await auth()
  if (!session) return { error: "Not authenticated" }

  const last = await prisma.addon.findFirst({
    where: { addonGroupId: data.addonGroupId },
    orderBy: { sortOrder: "desc" },
  })

  await prisma.addon.create({
    data: {
      name: data.name.trim(),
      price: data.price,
      isAvailable: data.isAvailable,
      sortOrder: (last?.sortOrder ?? 0) + 1,
      addonGroupId: data.addonGroupId,
    },
  })

  revalidatePath("/menu/variants")
  return { success: true, message: "Addon created successfully" }
}

export async function updateAddon(data: {
  id: string
  name: string
  price: number
  isAvailable: boolean
}) {
  const session = await auth()
  if (!session) return { error: "Not authenticated" }

  await prisma.addon.update({
    where: { id: data.id },
    data: {
      name: data.name.trim(),
      price: data.price,
      isAvailable: data.isAvailable,
    },
  })

  revalidatePath("/menu/variants")
  return { success: true, message: "Addon updated successfully" }
}

export async function deleteAddon(id: string) {
  const session = await auth()
  if (!session) return { error: "Not authenticated" }

  await prisma.addon.delete({ where: { id } })
  revalidatePath("/menu/variants")
  return { success: true, message: "Addon deleted successfully" }
}