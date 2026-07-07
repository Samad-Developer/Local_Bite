import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import VariantsClient from "./variants-client"

export default async function VariantsPage() {
  const session = await auth()
  if (!session) return null

  const menuItems = await prisma.menuItem.findMany({
    where: { restaurantId: session.user.restaurantId },
    orderBy: { sortOrder: "asc" },
    include: {
      category: true,
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      variants: {
        orderBy: { sortOrder: "asc" },
        include: {
          addonGroups: {
            orderBy: { sortOrder: "asc" },
            include: {
              addons: { orderBy: { sortOrder: "asc" } },
            },
          },
        },
      },
    },
  })

  console.log("Just Checking How Menu Items with Variants Looks like", menuItems)

  return <VariantsClient menuItems={menuItems} />
}