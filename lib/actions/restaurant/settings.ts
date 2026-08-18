"use server";

import {  cacheTag, updateTag } from "next/cache";
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
        orderBy: { day: "asc" },
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

    await tx.restaurantImage.deleteMany({
      where: { restaurantId: restaurantId },
    });

    await tx.restaurantImage.createMany({
      data: data.coverImages.map((coverImageUrl) => ({
        restaurantId: restaurantId,
        url: coverImageUrl,
      })),
    });
  });

  updateTag("restaurantInfo");
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

  updateTag("restaurantInfo");
  return { success: true, message: "Restaurant Open and Close Hours Updated" };
}

export async function updateOrderModes(data: {
  dineIn: boolean;
  takeaway: boolean;
  delivery: boolean;
  deliveryFee?: number | undefined;
  minimumOrder?: number | undefined;
  estimatedTime?: number | undefined;
}) {
  const restaurantId = await getRestaurantId();

  await prisma.restaurant.update({
    where: { id: restaurantId },
    data: {
      dineIn: data.dineIn,
      takeaway: data.takeaway,
      delivery: data.delivery,
      deliveryFee: data.deliveryFee,
      minimumOrder: data.minimumOrder,
      estimatedTime: data.estimatedTime,
    },
  });

  updateTag("restaurantInfo");
  return { success: true, message: "Order modes updated successfully." };
}

export async function updatePaymentModes(data: {
  acceptsCash: boolean;
  acceptsCard: boolean;
  acceptsOnline: boolean;
}) {
  const restaurantId = await getRestaurantId();

  const updatedRestaurant = await prisma.restaurant.update({
    where: { id: restaurantId },
    data: {
      acceptsCard: data.acceptsCard,
      acceptsCash: data.acceptsCash,
      acceptsOnline: data.acceptsOnline,
    },
  });

  updateTag("restaurantInfo");
  return { success: true, message: "Payment modes updated successfully." };
}
