import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ restaurantId: string }> }
) {
  try {
    const { restaurantId } = await params

    // fetch categories and delivery areas in parallel
    const [categories, deliveryAreas] = await Promise.all([
      prisma.category.findMany({
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
                    AND: [
                      {
                        OR: [
                          { startDate: null },
                          { startDate: { lte: new Date() } }
                        ]
                      },
                      {
                        OR: [
                          { endDate: null },
                          { endDate: { gte: new Date() } }
                        ]
                      }
                    ]
                  }
                },
                take: 1,
                select: {
                  discount: {
                    select: {
                      id: true,
                      name: true,
                      type: true,
                      value: true,
                    }
                  }
                }
              }
            }
          }
        }
      }),

      // fetch active delivery areas
      prisma.deliveryArea.findMany({
        where: {
          restaurantId,
          isActive: true,
        },
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          name: true,
          deliveryFee: true,
        }
      })
    ])

    // process categories
    const result = categories.map((category) => ({
      id: category.id,
      name: category.name,
      sortOrder: category.sortOrder,
      menuItems: category.menuItems.map((item) => {
        const activeDiscount = item.discounts[0]?.discount ?? null

        const variants = item.variants.map((variant) => ({
          ...variant,
          finalPrice: computeFinalPrice(variant.price, activeDiscount),
        }))

        return {
          id: item.id,
          name: item.name,
          description: item.description,
          isAvailable: item.isAvailable,
          isBestseller: item.isBestseller,
          isNew: item.isNew,
          spicyLevel: item.spicyLevel,
          foodType: item.foodType,
          images: item.images,
          variants,
          discount: activeDiscount ?? null,
        }
      })
    })).filter((category) => category.menuItems.length > 0)

    return NextResponse.json({
      categories: result,
      deliveryAreas,
      totalItems: result.reduce(
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

function computeFinalPrice(
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