"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { getRestaurantId } from "@/lib/utils/auth-utils"

// ── Get all areas ──────────────────────────────────

export async function getDeliveryAreas() {
  const restaurantId = await getRestaurantId()

  return await prisma.deliveryArea.findMany({
    where: { restaurantId },
    orderBy: { sortOrder: "asc" },
  })
}

// ── Create area ────────────────────────────────────

export async function createDeliveryArea(data: {
  name: string
  deliveryFee: number
  isActive: boolean
}) {
  const restaurantId = await getRestaurantId()

  const last = await prisma.deliveryArea.findFirst({
    where: { restaurantId },
    orderBy: { sortOrder: "desc" },
  })

  await prisma.deliveryArea.create({
    data: {
      name: data.name.trim(),
      deliveryFee: data.deliveryFee,
      isActive: data.isActive,
      sortOrder: (last?.sortOrder ?? 0) + 1,
      restaurantId,
    },
  })

  revalidatePath("/settings")
  return { success: true, message: "Delivery area created successfully" }
}

// ── Update area ────────────────────────────────────

export async function updateDeliveryArea(
  data: {
    name: string
    deliveryFee: number
    isActive: boolean
  } & { id: string }
) {
  await prisma.deliveryArea.update({
    where: { id: data.id },
    data: {
      name: data.name.trim(),
      deliveryFee: data.deliveryFee,
      isActive: data.isActive,
    },
  })

  revalidatePath("/settings")
  return { success: true, message: "Delivery area updated successfully" }
}

// ── Delete area ────────────────────────────────────

export async function deleteDeliveryArea(id: string) {
  await prisma.deliveryArea.delete({ where: { id } })
  revalidatePath("/settings")
  return { success: true, message: "Delivery area deleted successfully" }
}