import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { z } from "zod"
import {
  activeDiscountWhere,
  computeFinalPrice,
  resolveActiveDiscount,
} from "@/lib/utils/pricing"

/** Prices are Float columns, so compare with a tolerance rather than equality. */
const PRICE_EPSILON = 0.01

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
    quantity: z.number().int().min(1),
    specialInstructions: z.string().optional(),
    variantId: z.string(),
    addons: z.array(z.object({ addonId: z.string() })).optional(),
    // Client-supplied prices are still accepted so the currently deployed
    // storefront keeps working, but they are never trusted — only compared,
    // so we can tell the client whether what it displayed was correct.
    unitPrice: z.number().optional(),
    totalPrice: z.number().optional(),
    variantName: z.string().optional(),
    variantPrice: z.number().optional(),
  })).nonempty(),
  subtotal: z.number().optional(),
  deliveryFee: z.number().optional(),
  total: z.number().optional(),
})

type ProblemReason =
  | "VARIANT_UNAVAILABLE"
  | "ITEM_MISMATCH"
  | "ADDON_UNAVAILABLE"
  | "ADDON_SELECTION_INVALID"

interface Problem {
  menuItemId: string
  variantId: string
  addonId: string | null
  reason: ProblemReason
}

function reject(
  code: string,
  message: string,
  extra: Record<string, unknown> = {}
) {
  return NextResponse.json(
    { error: "ORDER_REJECTED", code, message, ...extra },
    { status: 409 }
  )
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = orderSchema.parse(body)
    const now = new Date()

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: data.restaurantId },
      select: {
        id: true,
        isOpen: true,
        deliveryFee: true,
        minimumOrder: true,
        dineIn: true,
        takeaway: true,
        delivery: true,
        acceptsCash: true,
        acceptsCard: true,
        acceptsOnline: true,
      },
    })

    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 })
    }

    if (!restaurant.isOpen) {
      return reject("RESTAURANT_CLOSED", "The restaurant is currently closed.")
    }

    const supportsType =
      (data.type === "DINE_IN" && restaurant.dineIn) ||
      (data.type === "TAKEAWAY" && restaurant.takeaway) ||
      (data.type === "DELIVERY" && restaurant.delivery)

    if (!supportsType) {
      return reject("ORDER_TYPE_UNAVAILABLE", "That order type is not available right now.")
    }

    const supportsPayment =
      (data.paymentMethod === "CASH" && restaurant.acceptsCash) ||
      (data.paymentMethod === "CARD" && restaurant.acceptsCard) ||
      (data.paymentMethod === "ONLINE" && restaurant.acceptsOnline)

    if (!supportsPayment) {
      return reject("PAYMENT_METHOD_UNAVAILABLE", "That payment method is not accepted.")
    }

    // Only variants that are available AND belong to this restaurant. Ownership
    // was previously unchecked, so one restaurant's items could be ordered
    // through another restaurant's storefront.
    const variants = await prisma.variant.findMany({
      where: {
        id: { in: data.items.map((i) => i.variantId) },
        isAvailable: true,
        menuItem: {
          isAvailable: true,
          restaurantId: data.restaurantId,
          category: { isVisible: true },
        },
      },
      select: {
        id: true,
        name: true,
        price: true,
        menuItemId: true,
        menuItem: {
          select: {
            id: true,
            discounts: {
              where: activeDiscountWhere(now),
              take: 1,
              select: { discount: { select: { type: true, value: true } } },
            },
          },
        },
        addonGroups: {
          select: {
            id: true,
            isRequired: true,
            isMultiple: true,
            minSelections: true,
            maxSelections: true,
            addons: {
              where: { isAvailable: true },
              select: { id: true, name: true, price: true },
            },
          },
        },
      },
    })

    const variantById = new Map(variants.map((v) => [v.id, v]))

    const problems: Problem[] = []
    const priced: {
      quantity: number
      clientUnitPrice?: number
      clientTotalPrice?: number
      variantId: string
      variantName: string
      variantListPrice: number
      menuItemId: string
      addons: { id: string; name: string; price: number }[]
      unitPrice: number
      totalPrice: number
      listTotal: number
    }[] = []

    for (const item of data.items) {
      const variant = variantById.get(item.variantId)

      if (!variant) {
        problems.push({
          menuItemId: item.menuItemId,
          variantId: item.variantId,
          addonId: null,
          reason: "VARIANT_UNAVAILABLE",
        })
        continue
      }

      if (variant.menuItemId !== item.menuItemId) {
        problems.push({
          menuItemId: item.menuItemId,
          variantId: item.variantId,
          addonId: null,
          reason: "ITEM_MISMATCH",
        })
        continue
      }

      // Addon ids are only meaningful within their own variant, so scope the
      // lookup rather than building one global map.
      const addonById = new Map(
        variant.addonGroups.flatMap((group) =>
          group.addons.map((addon) => [addon.id, { ...addon, groupId: group.id }] as const)
        )
      )

      const resolvedAddons: { id: string; name: string; price: number; groupId: string }[] = []
      let addonMissing = false

      for (const requested of item.addons ?? []) {
        const addon = addonById.get(requested.addonId)
        if (!addon) {
          problems.push({
            menuItemId: item.menuItemId,
            variantId: item.variantId,
            addonId: requested.addonId,
            reason: "ADDON_UNAVAILABLE",
          })
          addonMissing = true
          continue
        }
        resolvedAddons.push(addon)
      }

      if (addonMissing) continue

      // Enforce the same group rules the storefront applies at add-to-cart time.
      const invalidGroup = variant.addonGroups.some((group) => {
        const count = resolvedAddons.filter((a) => a.groupId === group.id).length
        if (group.isRequired && count < group.minSelections) return true
        if (!group.isMultiple && count > 1) return true
        return group.maxSelections !== null && count > group.maxSelections
      })

      if (invalidGroup) {
        problems.push({
          menuItemId: item.menuItemId,
          variantId: item.variantId,
          addonId: null,
          reason: "ADDON_SELECTION_INVALID",
        })
        continue
      }

      const discount = resolveActiveDiscount(variant.menuItem.discounts)
      const finalVariantPrice = computeFinalPrice(variant.price, discount)
      const addonsTotal = resolvedAddons.reduce((sum, a) => sum + a.price, 0)

      const unitPrice = finalVariantPrice + addonsTotal

      priced.push({
        quantity: item.quantity,
        clientUnitPrice: item.unitPrice,
        clientTotalPrice: item.totalPrice,
        variantId: variant.id,
        variantName: variant.name,
        variantListPrice: variant.price,
        menuItemId: variant.menuItemId,
        addons: resolvedAddons.map(({ id, name, price }) => ({ id, name, price })),
        unitPrice,
        totalPrice: unitPrice * item.quantity,
        listTotal: (variant.price + addonsTotal) * item.quantity,
      })
    }

    if (problems.length > 0) {
      return reject(
        "ITEMS_UNAVAILABLE",
        "Some items in your cart are no longer available.",
        { problems }
      )
    }

    const subtotal = priced.reduce((sum, line) => sum + line.totalPrice, 0)
    const discountTotal = priced.reduce((sum, line) => sum + (line.listTotal - line.totalPrice), 0)

    let deliveryFee = 0
    let deliveryAreaId: string | null = null

    if (data.type === "DELIVERY") {
      if (data.deliveryAreaId) {
        const area = await prisma.deliveryArea.findFirst({
          where: {
            id: data.deliveryAreaId,
            restaurantId: data.restaurantId,
            isActive: true,
          },
          select: { id: true, deliveryFee: true },
        })

        if (!area) {
          return reject("DELIVERY_AREA_INVALID", "That delivery area is not available.")
        }

        deliveryFee = area.deliveryFee
        deliveryAreaId = area.id
      } else {
        deliveryFee = restaurant.deliveryFee
      }

      if (subtotal < restaurant.minimumOrder) {
        return reject("BELOW_MINIMUM", "Your order is below the delivery minimum.", {
          context: { minimumOrder: restaurant.minimumOrder, subtotal },
        })
      }
    }

    const total = subtotal + deliveryFee

    // Did the client show the customer a different number than the truth?
    const drifted = (claimed: number | undefined, actual: number) =>
      claimed !== undefined && Math.abs(claimed - actual) > PRICE_EPSILON

    const repriced =
      drifted(data.subtotal, subtotal) ||
      drifted(data.total, total) ||
      priced.some(
        (line) =>
          drifted(line.clientUnitPrice, line.unitPrice) ||
          drifted(line.clientTotalPrice, line.totalPrice)
      )

    if (repriced) {
      console.warn("Order re-priced server-side", {
        restaurantId: data.restaurantId,
        clientSubtotal: data.subtotal,
        serverSubtotal: subtotal,
        clientTotal: data.total,
        serverTotal: total,
      })
    }

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
          deliveryAreaId,
          subtotal,
          deliveryFee,
          discount: discountTotal,
          total,
          status: "NEW",
          paymentStatus: "PENDING",
        },
      })

      for (const line of priced) {
        const orderItem = await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            menuItemId: line.menuItemId,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            totalPrice: line.totalPrice,
          },
        })

        await tx.orderItemVariant.create({
          data: {
            orderItemId: orderItem.id,
            variantId: line.variantId,
            name: line.variantName,
            price: line.variantListPrice,
          },
        })

        if (line.addons.length > 0) {
          await tx.orderItemAddon.createMany({
            data: line.addons.map((addon) => ({
              orderItemId: orderItem.id,
              addonId: addon.id,
              name: addon.name,
              price: addon.price,
            })),
          })
        }
      }

      return newOrder
    }, { timeout: 15000 })

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      message: "Order placed successfully",
      pricing: {
        repriced,
        subtotal,
        deliveryFee,
        discount: discountTotal,
        total,
        items: priced.map((line) => ({
          menuItemId: line.menuItemId,
          variantId: line.variantId,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          totalPrice: line.totalPrice,
        })),
      },
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
