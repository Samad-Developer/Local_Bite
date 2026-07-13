"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function getDiscounts() {
  const session = await auth();
  if (!session) return [];

  const discounts = await prisma.discount.findMany({
    where: {
      restaurantId: session.user.restaurantId,
    },
    include: {
      items: {
        include: {
          menuItem: true,
          category: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return discounts;
}

export async function createDiscount(): Promise<{ success?: boolean; error?: string; message?: string }> {
 return await new Promise((resolve, reject) => setTimeout(resolve, 2000))
}

export async function updateDiscount(): Promise<{ success?: boolean; error?: string; message?: string }> {
 return await new Promise((resolve, reject) => setTimeout(resolve, 2000))
}