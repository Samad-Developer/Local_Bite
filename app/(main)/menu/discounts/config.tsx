import { string, z } from "zod";

// --- Discount Type ------------------

export type DiscountItem = {
  id: string;
  discountId: string;
  menuItemId: string | null;
  categoryId: string | null;
  menuItem: { id: string; name: string } | null;
  category: { id: string; name: string } | null;
};

export type Discount = {
  id: string;
  name: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  startDate: Date | null;
  endDate: Date | null;
  isActive: boolean;
  restaurantId: string;
  items: DiscountItem[];
};

// --- Discount Schema ----------------

export const DiscountSchema = z.object({
  name: z.string().min(3, "Discount name is Required").max(40, "Name too long"),
  type: z.enum(["PERCENTAGE", "FIXED"]),
  value: z.coerce.number().min(0),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  isActive: z.boolean(),
  productIds: z.array(z.string()).default([]),
  categoryIds: z.array(z.string()).default([]),
});

export type DiscountFormData = z.infer<typeof DiscountSchema>;


// --- Default values for Discount Form -------------

export const discountFormDefaultValues: DiscountFormData = {
  name: "",
  type: "PERCENTAGE",
  value: 0,
  startDate: undefined,   
  endDate: undefined,     
  isActive: true,
  productIds: [],
  categoryIds: [],
}