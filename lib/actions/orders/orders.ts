"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { OrderStatus } from "@prisma/client"

// Get all orders for this restaurant
export async function getOrders({
  status,
  search,
}: {
  status?: OrderStatus
  search?: string
} = {}) {
  const session = await auth()
  if (!session) return []

  return await prisma.order.findMany({
    where: {
      restaurantId: session.user.restaurantId,
      ...(status && { status }),
      ...(search && {
        OR: [
          { customerName: { contains: search, mode: "insensitive" } },
          { customerPhone: { contains: search, mode: "insensitive" } },
        ]
      })
    },
    include: {
      items: {
        include: {
          menuItem: true,
          variant: true,
          addons: true,
        }
      }
    },
    orderBy: { createdAt: "desc" },
  })
}

// Get single order detail
export async function getOrderById(id: string) {
  const session = await auth()
  if (!session) return null

  // findFirst, not findUnique: findUnique only filters on unique fields, so
  // the restaurant scope below would be rejected. The scope is what stops an
  // id from another tenant being read by guessing the URL.
  return await prisma.order.findFirst({
    where: { id, restaurantId: session.user.restaurantId },
    include: {
      items: {
        include: {
          menuItem: {
            include: {
              images: { take: 1 },
              category: { select: { name: true } },
            }
          },
          variant: true,
          addons: true,
        }
      },
      deliveryArea: true,
    }
  })
}

/** The exact shape `getOrderById` resolves to, for the detail view. */
export type OrderDetail = NonNullable<
  Awaited<ReturnType<typeof getOrderById>>
>

// Update order status
export async function updateOrderStatus(id: string, status: OrderStatus) {
  const session = await auth()
  if (!session) return { error: "Not authenticated" }

  // updateMany, not update: it takes a non-unique where, so the restaurant
  // scope is enforced in the query itself rather than trusting the id.
  const { count } = await prisma.order.updateMany({
    where: { id, restaurantId: session.user.restaurantId },
    data: { status }
  })

  if (count === 0) return { error: "Order not found" }

  revalidatePath("/orders")
  revalidatePath(`/orders/${id}`)
  return { success: true, message: `Order status updated to ${status}` }
}