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
