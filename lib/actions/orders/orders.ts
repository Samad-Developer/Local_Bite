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

  return await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          menuItem: {
            include: {
              images: { take: 1 }
            }
          },
          variant: true,
          addons: true,
        }
      }
    }
  })
}

// Update order status
export async function updateOrderStatus(id: string, status: OrderStatus) {
  const session = await auth()
  if (!session) return { error: "Not authenticated" }

  await prisma.order.update({
    where: { id },
    data: { status }
  })

  revalidatePath("/orders")
  revalidatePath(`/orders/${id}`)
  return { success: true, message: `Order status updated to ${status}` }
}