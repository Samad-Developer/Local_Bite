import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { z } from "zod"

const orderSchema = z.object({
  restaurantId: z.string(),
  customerName: z.string().min(1),
  customerPhone: z.string().min(1),
  customerAddress: z.string().optional(),
  type: z.enum(["DINE_IN", "TAKEAWAY", "DELIVERY"]),
  paymentMethod: z.enum(["CASH", "CARD", "ONLINE"]),
  specialNotes: z.string().optional(),
  deliveryAreaId: z.string().optional(),
  items: z.array(z.object({
    menuItemId: z.string(),
    quantity: z.number().min(1),
    unitPrice: z.number(),
    totalPrice: z.number(),
    specialInstructions: z.string().optional(),
    variantId: z.string().optional(),
    variantName: z.string().optional(),
    variantPrice: z.number().optional(),
    addons: z.array(z.object({
      addonId: z.string(),
      name: z.string(),
      price: z.number(),
    })).optional(),
  })),
  subtotal: z.number(),
  deliveryFee: z.number().optional(),
  total: z.number(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = orderSchema.parse(body)

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          restaurantId: data.restaurantId,
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          customerAddress: data.customerAddress,
          type: data.type,
          paymentMethod: data.paymentMethod,
          specialNotes: data.specialNotes,
          deliveryAreaId: data.deliveryAreaId ?? null,
          subtotal: data.subtotal,
          deliveryFee: data.deliveryFee ?? 0,
          total: data.total,
          status: "NEW",
          paymentStatus: "PENDING",
        }
      })

      for (const item of data.items) {
        const orderItem = await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
          }
        })

        if (item.variantId && item.variantName && item.variantPrice !== undefined) {
          await tx.orderItemVariant.create({
            data: {
              orderItemId: orderItem.id,
              variantId: item.variantId,
              name: item.variantName,
              price: item.variantPrice,
            }
          })
        }

        if (item.addons && item.addons.length > 0) {
          await tx.orderItemAddon.createMany({
            data: item.addons.map((addon) => ({
              orderItemId: orderItem.id,
              addonId: addon.addonId,
              name: addon.name,
              price: addon.price,
            }))
          })
        }
      }

      return newOrder
    })

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      message: "Order placed successfully"
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid order data", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Order creation failed:", error)
    return NextResponse.json(
      { error: "Failed to place order" },
      { status: 500 }
    )
  }
}
