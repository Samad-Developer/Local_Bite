import { FieldConfig } from "@/components/shared/form/field-config.types";
import { string, z } from "zod";

// --- Discount Type --------------------------------------------------------------------

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

// --- Discount Schema ------------------------------------------------------------------

export const discountSchema = z.object({
  name: z.string().min(3, "Discount name is Required").max(40, "Name too long"),
  type: z.enum(["PERCENTAGE", "FIXED"]),
  value: z.coerce.number().min(0),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  isActive: z.boolean(),
  productIds: z.array(z.string()).default([]),
  categoryIds: z.array(z.string()).default([]),
});

export type DiscountFormData = z.infer<typeof discountSchema>;

// --- Default values for Discount Form --------------------------------------------------

export const discountFormDefaultValues: DiscountFormData = {
  name: "",
  type: "PERCENTAGE",
  value: 0,
  startDate: undefined,
  endDate: undefined,
  isActive: true,
  productIds: [],
  categoryIds: [],
};

// --- Discount Form Fields Config ---------------------------------------------------------

export const discountFields = (
  products: { id: string; name: string }[],
  categories: { id: string; name: string }[],
): FieldConfig[] => [{
  name: "name",
  label: "Discount Name",
  type: "text",
  placeholder: "e.g. Eid Discount, Ramzan Offer",
},
{
  name: "type",
  label: "Type",
  type: "select",
  options: [
    {
      label: "Percentage",
      value: "PERCENTAGE",
    },
    {
      label: "Fixed Amount",
      value: "FIXED",
    },
  ],
  placeholder: "e.g. percentage, fixed",
},
{
  name: "value",
  label: "Value",
  type: "number",
  placeholder: "e.g. 20%, 399 Rs",
},
{
  name: "startDate",
  label: "Enter Start Date",
  type: "date",
  placeholder: "7/13/2026",
},
{
  name: "endDate",
  label: "Enter End Date",
  type: "date",
  placeholder: "7/13/2026",
},
{
  name: "isActive",
  label: "Is Active",
  type: "switch",
},
 {
    name: "productIds",
    label: "Applicable Menu Items",
    type: "multi-select",
    options: products.map(p => ({ label: p.name, value: p.id })),
    placeholder: "Select menu items",
  },
  {
    name: "categoryIds",
    label: "Applicable Categories",
    type: "multi-select",
    options: categories.map(c => ({ label: c.name, value: c.id })),
    placeholder: "Select categories",
  },
  ];
