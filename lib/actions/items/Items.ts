"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";

export async function getMenuItemById(id: string) {
  const session = await auth();
  if (!session) return null;

  const menuItem = await prisma.menuItem.findFirst({
    where: {
      id,
      restaurantId: session.user.restaurantId,
    },
    include: {
      category: true,
      images: { orderBy: { sortOrder: "asc" } },
      variants: {
        orderBy: {
          sortOrder: "asc",
        },
      },
      discounts: {
        include: {
          discount: true,
        },
        where: {
          discount: {
            isActive: true,
            OR: [{ endDate: null }, { endDate: { gte: new Date() } }],
          },
        },
      },
    },
  });

  return menuItem;
}

export async function getMenuItems({
  search,
  categoryId,
}: {
  search?: string;
  categoryId?: string;
} = {}) {
  const session = await auth();
  if (!session) return [];

  return await prisma.menuItem.findMany({
    where: {
      restaurantId: session.user.restaurantId,
      ...(search && { name: { contains: search, mode: "insensitive" } }),
      ...(categoryId && { categoryId }),
    },
    orderBy: { sortOrder: "asc" },
    include: {
      category: true,
      images: { orderBy: { sortOrder: "asc" } },
      variants: {
        orderBy: { sortOrder: "asc" },
      },
      discounts: {
        include: {
          discount: true,
        },
        where: {
          discount: {
            isActive: true,
            OR: [{ endDate: null }, { endDate: { gte: new Date() } }],
          },
        },
      },
    },
  });
}

export async function createMenuItem(data: {
  name: string;
  description?: string;
  sortOrder: number;
  categoryId: string;
  isBestseller: boolean;
  isNew: boolean;
  isAvailable: boolean;
  imageUrls: string[];
}) {
  const session = await auth();
  if (!session) return { error: "Not authenticated" };

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const item = await tx.menuItem.create({
      data: {
        name: data.name.trim(),
        description: data.description?.trim() || null,
        categoryId: data.categoryId,
        isBestseller: data.isBestseller,
        isNew: data.isNew,
        isAvailable: data.isAvailable,
        sortOrder: data.sortOrder,
        restaurantId: session.user.restaurantId,
      },
    });

    if (data.imageUrls.length > 0) {
      await tx.menuItemImage.createMany({
        data: data.imageUrls.map((url, index) => ({
          url,
          sortOrder: index,
          menuItemId: item.id,
        })),
      });
    }
  });

  revalidatePath("/menu/items");
  redirect("/menu/items");
}

export async function updateMenuItem(data: {
  id: string;
  name: string;
  description?: string;
  sortOrder: number;
  categoryId: string;
  isBestseller: boolean;
  isNew: boolean;
  isAvailable: boolean;
  imageUrls: string[];
}) {
  const session = await auth();
  if (!session) return { error: "Not authenticated" };

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.menuItem.update({
      where: { id: data.id },
      data: {
        name: data.name.trim(),
        description: data.description?.trim() || null,
        categoryId: data.categoryId,
        isBestseller: data.isBestseller,
        isNew: data.isNew,
        isAvailable: data.isAvailable,
        sortOrder: data.sortOrder,
      },
    });

    if (data.imageUrls.length > 0) {
      await tx.menuItemImage.deleteMany({
        where: { menuItemId: data.id },
      });
      await tx.menuItemImage.createMany({
        data: data.imageUrls.map((url, index) => ({
          url,
          sortOrder: index,
          menuItemId: data.id,
        })),
      });
    }
  });

  revalidatePath("/menu/items");
  redirect("/menu/items");
}

export async function deleteMenuItem(id: string) {
  const session = await auth();
  if (!session) return { error: "Not authenticated" };

  await prisma.menuItem.delete({ where: { id } });
  revalidatePath("/menu/items");
  return { success: true, message: "Item Deleted Successfully" };
}

export async function toggleItemAvailability(id: string, isAvailable: boolean) {
  const session = await auth();
  if (!session) return { error: "Not authenticated" };

  await prisma.menuItem.update({
    where: { id },
    data: { isAvailable: !isAvailable },
  });

  revalidatePath("/menu/items");
  return { success: true };
}
