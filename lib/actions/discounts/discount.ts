"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { DiscountFormData } from "@/app/(main)/menu/discounts/config"
import { revalidatePath } from "next/cache"

export async function getDiscounts() {
  const session = await auth()
  if (!session) return []

  return await prisma.discount.findMany({
    where: { restaurantId: session.user.restaurantId },
    include: {
      items: {
        include: {
          menuItem: {
            select: {
              id: true,
              name: true,
            }
          },
          category: {
            select: {
              id: true,
              name: true
            }
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function createDiscount(data: DiscountFormData) {
  const session = await auth()
  if (!session) return { error: "Not authenticated" }

  await prisma.$transaction(async (tx) => {
    const discount = await tx.discount.create({
      data: {
        name: data.name,
        value: data.value,
        type: data.type,
        isActive: data.isActive,
        startDate: data.startDate ?? null,
        endDate: data.endDate ?? null,
        restaurantId: session.user.restaurantId,
      },
    })

    if (data.productIds.length > 0) {
      await tx.discountItem.createMany({
        data: data.productIds.map((productId) => ({
          discountId: discount.id,
          menuItemId: productId,
          categoryId: null,
        })),
      })
    }

    if (data.categoryIds.length > 0) {
      await tx.discountItem.createMany({
        data: data.categoryIds.map((categoryId) => ({
          discountId: discount.id,
          menuItemId: null,
          categoryId: categoryId,
        })),
      })
    }
  })

  revalidatePath("/menu/discounts")
  return { success: true, message: "Discount created successfully" }
}

export async function updateDiscount(data: DiscountFormData & { id: string }) {
  const session = await auth()
  if (!session) return { error: "Not authenticated" }

  await prisma.$transaction(async (tx) => {
    const updatedDiscount = await tx.discount.update({
      where: { id: data.id },
      data: {
        name: data.name,
        value: data.value,
        type: data.type,
        isActive: data.isActive,
        startDate: data.startDate ?? null,
        endDate: data.endDate ?? null,
      },
    })

    await tx.discountItem.deleteMany({
      where: { discountId: data.id },
    })

    if (data.productIds.length > 0) {
      await tx.discountItem.createMany({
        data: data.productIds.map((productId) => ({
          discountId: updatedDiscount.id,
          menuItemId: productId,
          categoryId: null,
        })),
      })
    }

    if (data.categoryIds.length > 0) {
      await tx.discountItem.createMany({
        data: data.categoryIds.map((categoryId) => ({
          discountId: updatedDiscount.id,
          menuItemId: null,
          categoryId: categoryId,
        })),
      })
    }
  })

  revalidatePath("/menu/discounts")
  return { success: true, message: "Discount updated successfully" }
}

export async function deleteDiscount(id: string) {
  const session = await auth()
  if (!session) return { error: "Not authenticated" }

  await prisma.discount.delete({ where: { id } })

  revalidatePath("/menu/discounts")
  return { success: true, message: "Discount deleted successfully" }
}