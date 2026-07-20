"use server";

import { auth } from "@/auth";
import { cacheLife, cacheTag, revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getRestaurantId } from "@/lib/utils/auth-utils";

export async function getRestaurant() {
  const restaurantId = await getRestaurantId();

  return getCashedRestaurant({ restaurantId });
}

export async function getCashedRestaurant({
  restaurantId,
}: {
  restaurantId: string;
}) {
  "use cache";
  cacheTag("restaurantInfo");

  return await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    include: {
      operatingHours: {
        orderBy: { day: "asc" }, // Monday first
      },
      coverImages: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });
}


export async function createRestaurantSettings() {
  const restaurantId = await getRestaurantId();

  const allRestaurants =  await prisma.restaurant.findUnique({
    where : {
      id: restaurantId
    }
  })

  return { success : true, message: "testing"}
}

export async function updateRestaurantSettings() {
  const restaurantId = await getRestaurantId();

  return await prisma.restaurant.findUnique({
    where : {
      id: restaurantId
    }
  })
}