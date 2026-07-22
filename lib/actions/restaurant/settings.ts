"use server";

import { auth } from "@/auth";
import { cacheLife, cacheTag, revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getRestaurantId } from "@/lib/utils/auth-utils";
import { Prisma } from "@prisma/client";

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

export async function updateSettings(data: {
  name: string;
  address: string;
  city: string;
  phone: string;
  logoUrl: string;
  coverImages: string[];
}) {
  const restaurantId = await getRestaurantId();

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // first update the restarunt info
    await tx.restaurant.update({
      where: { id: restaurantId },
      data: {
        name: data.name,
        address: data.address,
        city: data.city,
        phone: data.phone,
        logoUrl: data.logoUrl,
      },
    });

    // first delet all images from data base
    await tx.restaurantImage.deleteMany({
      where: { restaurantId: restaurantId },
    });

    // Recreate all images again
    await tx.restaurantImage.createMany({
      data: data.coverImages.map((coverImageUrl) => ({
        restaurantId: restaurantId,
        url: coverImageUrl,
      })),
    });
  });

  revalidatePath("/settings");
  return { success: true, message: "Restaurant Info Updted Successfully." };
}

export async function updateHours(
  data: {
    day: number;
    isOpen: boolean;
    openTime: string;
    closeTime: string;
  }[],
) {
  const restaurantId = await getRestaurantId();

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    
    await tx.operatingHours.deleteMany({
      where: {
        restaurantId: restaurantId,
      },
    });

    await tx.operatingHours.createMany({
      data: data.map((hour) => ({
        restaurantId,
        day: hour.day,
        isOpen: hour.isOpen,
        openTime: hour.openTime,
        closeTime: hour.closeTime,
      })),
    });

  });

  revalidatePath("/settings")
  return { success: true, message: "Restaurant Open and Close Hours Updated" };
}
