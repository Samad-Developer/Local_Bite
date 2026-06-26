import { getCategories } from "@/lib/actions/categories/categories";
import { MenuItemClient } from "./MenuItemClient";
import { getMenuItemById } from "@/lib/actions/items/Items";

const page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  const [categories, item] = await Promise.all([
    getCategories(),
    getMenuItemById(id),
  ]);

  return <MenuItemClient categories={categories} item={item ?? undefined} />;
};

export default page;
