import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const restaurant = await prisma.restaurant.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        cuisineType: true,
        city: true,
        address: true,
        phone: true,
        logoUrl: true,
        isOpen: true,
        dineIn: true,
        takeaway: true,
        delivery: true,
        deliveryFee: true,
        minimumOrder: true,
        estimatedTime: true,
        acceptsCash: true,
        acceptsCard: true,
        acceptsOnline: true,
        coverImages: {
          orderBy: { sortOrder: "asc" },
          select: {
            id: true,
            url: true,
            sortOrder: true,
          }
        },
        operatingHours: {
          orderBy: { day: "asc" },
          select: {
            day: true,
            isOpen: true,
            openTime: true,
            closeTime: true,
          }
        },
      }
    })

    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(restaurant)

  } catch (error) {
    console.error("Failed to fetch restaurant:", error)
    return NextResponse.json(
      { error: "Failed to fetch restaurant" },
      { status: 500 }
    )
  }
}