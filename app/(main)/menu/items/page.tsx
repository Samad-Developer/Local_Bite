import { getMenuItems } from "@/lib/actions/items/Items";
import { getCategories } from "@/lib/actions/categories/categories";
import MenuItemsClient from "./menu-items-client";

export default async function MenuItemsPage() {
  const [menuItems, categories] = await Promise.all([
    getMenuItems(),
    getCategories(),
  ]);

  return <MenuItemsClient menuItems={menuItems} categories={categories} />;
}
