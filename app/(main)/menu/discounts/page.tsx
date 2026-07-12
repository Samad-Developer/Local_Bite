import DiscountClient from "./discount-client";
import { getDiscounts } from "@/lib/actions/discounts/discount";

const page = async () => {
  const discounts = await getDiscounts();

  return <DiscountClient discounts={discounts} />;
};

export default page;
