"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export async function getCategories({ search }: { search?: string } = {}) {
  const session = await auth()
  if (!session) return []

  return await prisma.category.findMany({
    where: {
      restaurantId: session.user.restaurantId,
      ...(search && {
        name: { contains: search, mode: "insensitive" }
      }),
    },
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { menuItems: true } } }
  })
}

export async function createCategory(data: {
  name: string
  sortOrder: number
  isVisible: boolean
}) {
  const session = await auth()
  if (!session) return { error: "Not authenticated" }

  await prisma.category.create({
    data: {
      name: data.name.trim(),
      sortOrder: data.sortOrder,
      isVisible: data.isVisible,
      restaurantId: session.user.restaurantId,
    }
  })

  revalidatePath("/menu/categories")
  return { success: true }
}

export async function updateCategory(data: {
  id: string
  name: string
  sortOrder: number
  isVisible: boolean
}) {
  const session = await auth()
  if (!session) return { error: "Not authenticated" }

  await prisma.category.update({
    where: { id: data.id },
    data: {
      name: data.name.trim(),
      sortOrder: data.sortOrder,
      isVisible: data.isVisible,
    }
  })

  revalidatePath("/menu/categories")
  return { success: true }
}

export async function deleteCategory(id: string) {
  const session = await auth()
  if (!session) return { error: "Not authenticated" }

  const count = await prisma.menuItem.count({ where: { categoryId: id } })
  if (count > 0) {
    return { error: `Cannot delete. This category has ${count} menu items.` }
  }

  await prisma.category.delete({ where: { id } })
  revalidatePath("/menu/categories")
  return { success: true }
}