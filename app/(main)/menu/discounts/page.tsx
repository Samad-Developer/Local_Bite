import { getMenuItems } from "@/lib/actions/items/Items";
import DiscountClient from "./discount-client";
import { getDiscounts } from "@/lib/actions/discounts/discount";
import { getCategories } from "@/lib/actions/categories/categories";

const page = async () => {
const [discounts, products, categories] = await Promise.all([
  getDiscounts(),
  getMenuItems(),
  getCategories(),
])

return (
  <DiscountClient
    discounts={discounts}
    products={products}
    categories={categories}
  />
)
};

export default page;
