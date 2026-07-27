import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ restaurantId: string }> }
) {
  try {
    const { restaurantId } = await params

    // fetch all visible categories with available items
    const categories = await prisma.category.findMany({
      where: {
        restaurantId,
        isVisible: true,
      },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        name: true,
        sortOrder: true,
        menuItems: {
          where: { isAvailable: true },
          orderBy: { sortOrder: "asc" },
          select: {
            id: true,
            name: true,
            description: true,
            isAvailable: true,
            isBestseller: true,
            isNew: true,
            spicyLevel: true,
            foodType: true,
            images: {
              orderBy: { sortOrder: "asc" },
              take: 1,
              select: { url: true }
            },
            variants: {
              where: { isAvailable: true },
              orderBy: { sortOrder: "asc" },
              select: {
                id: true,
                name: true,
                price: true,
                isDefault: true,
                sortOrder: true,
                addonGroups: {
                  orderBy: { sortOrder: "asc" },
                  select: {
                    id: true,
                    name: true,
                    isRequired: true,
                    isMultiple: true,
                    minSelections: true,
                    maxSelections: true,
                    sortOrder: true,
                    addons: {
                      where: { isAvailable: true },
                      orderBy: { sortOrder: "asc" },
                      select: {
                        id: true,
                        name: true,
                        price: true,
                        sortOrder: true,
                      }
                    }
                  }
                }
              }
            },
            discounts: {
              where: {
                discount: {
                  isActive: true,
                  OR: [
                    { endDate: null },
                    { endDate: { gte: new Date() } },
                    { startDate: null },
                    { startDate: { lte: new Date() } },
                  ]
                }
              },
              select: {
                discount: {
                  select: {
                    id: true,
                    name: true,
                    type: true,
                    value: true,
                  }
                }
              },
              take: 1,
            }
          }
        }
      }
    })

    // compute final price for each item
    const categoriesWithPricing = categories.map((category) => ({
      ...category,
      menuItems: category.menuItems.map((item) => {
        const activeDiscount = item.discounts[0]?.discount ?? null

        // compute final price per variant
        const variantsWithFinalPrice = item.variants.map((variant) => ({
          ...variant,
          finalPrice: computeDiscountedPrice(variant.price, activeDiscount),
        }))

        return {
          ...item,
          variants: variantsWithFinalPrice,
          activeDiscount,
          discounts: undefined, // clean up raw discounts from response
        }
      })
    }))

    return NextResponse.json({
      categories: categoriesWithPricing,
      totalItems: categories.reduce(
        (sum, cat) => sum + cat.menuItems.length, 0
      ),
    })

  } catch (error) {
    console.error("Failed to fetch menu:", error)
    return NextResponse.json(
      { error: "Failed to fetch menu" },
      { status: 500 }
    )
  }
}

// ── Utility ────────────────────────────────────────

function computeDiscountedPrice(
  price: number,
  discount: { type: string; value: number } | null
): number {
  if (!discount) return price

  if (discount.type === "PERCENTAGE") {
    return Math.max(0, price - (price * discount.value) / 100)
  }

  if (discount.type === "FIXED") {
    return Math.max(0, price - discount.value)
  }

  return price
}