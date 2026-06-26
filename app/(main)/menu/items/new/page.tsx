import { getCategories } from "@/lib/actions/categories/categories";
import { MenuItemClient } from "../[id]/edit/MenuItemClient";

const page = async () => {
  const categories = await getCategories();

  return <MenuItemClient categories={categories} />;
};

export default page;
