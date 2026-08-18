import { FieldConfig } from "@/components/shared/form/field-config.types";
import { ColumnDef } from "@tanstack/react-table";
import { string, z } from "zod";
import { Button } from "@/components/ui/button";
import { Trash2, Pencil } from "lucide-react";
import { format } from "date-fns";

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

export const discountSchema = z.object({
  name: z.string().min(3, "Discount name is Required").max(40, "Name too long"),
  type: z.enum(["PERCENTAGE", "FIXED"]),
  value: z.coerce.number().min(0),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  isActive: z.boolean(),
  productIds: z.array(z.string()),
  categoryIds: z.array(z.string()),
});

export type DiscountFormData = z.infer<typeof discountSchema>;

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

export const discountFields = (
  products: { id: string; name: string }[],
  categories: { id: string; name: string }[],
): FieldConfig[] => [
  {
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
    options: products.map((p) => ({ label: p.name, value: p.id })),
    placeholder: "Select menu items",
    className: "col-span-3"
  },
  {
    name: "categoryIds",
    label: "Applicable Categories",
    type: "multi-select",
    options: categories.map((c) => ({ label: c.name, value: c.id })),
    placeholder: "Select categories",
    className:"col-span-3"
  },
  
];


export const discountTableColumns = (
  onEdit: (row: Discount) => void,
  onDelete: (row: Discount) => void,
): ColumnDef<Discount>[] => [
  {
    accessorKey: "name",
    header: "Name"
  },
  {
    accessorKey: "type",
    header: "Discount Type",
  },
  {
    accessorKey: "value",
    header: "Value",
  },
  {
    accessorKey: "isActive",
    header: "Is Active"
  },
 {
  accessorKey: "startDate",
  header: "Start Date",
  cell: ({ row }) => {
    const date = row.original.startDate;

    return date ? format(new Date(date), "dd MMM yyyy") : "-";
  },
},
{
  accessorKey: "endDate",
  header: "End Date",
  cell: ({ row }) => {
    const date = row.original.endDate;

    return date ? format(new Date(date), "dd MMM yyyy") : "-";
  },
},
    {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => (
      <div className="flex items-center justify-end gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-[#9ca3af] hover:text-[#111111]"
          onClick={() => onEdit(row.original)}
        >
          <Pencil className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-[#9ca3af] hover:text-[#dc2626] hover:bg-[#fef2f2]"
          onClick={() => onDelete(row.original)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    ),
  },
]
