import { getMenuItems } from "@/lib/actions/items/Items";
import { getCategories } from "@/lib/actions/categories/categories";
import MenuItemsClient from "./menu-items-client";

export default async function MenuItemsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; categoryId?: string }>
}) {
  // const { search, categoryId } = await searchParams

  const [menuItems, categories] = await Promise.all([
    getMenuItems(),
    getCategories(),
  ])

  console.log("checking menu Items data", menuItems)

  return (
    <MenuItemsClient
      menuItems={menuItems}
      categories={categories}
    />
  )
}