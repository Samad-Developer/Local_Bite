"use client";

import { z } from "zod";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, UtensilsCrossed } from "lucide-react";
import { FieldConfig } from "@/components/shared/form/field-config.types";
import { computeFinalPrice } from "@/lib/utils/pricing";
import Image from "next/image";

// ── Types ──────────────────────────────────────────

export type Category = {
  id: string;
  name: string;
};

export type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  basePrice: number;
  categoryId: string;
  isBestseller: boolean;
  isNew: boolean;
  isAvailable: boolean;
  sortOrder: number;
  category: Category;
  images: { id: string; url: string; sortOrder: number }[];
  discounts: {
    discount: {
      id: string;
      name: string;
      type: string;
      value: number;
      isActive: boolean;
    };
  }[];
};

// ── Schema ─────────────────────────────────────────

export const menuItemSchema = z.object({
  name: z.string().min(1, "Item name is required").max(100),
  description: z.string().max(500).optional(),
  basePrice: z.coerce.number().min(1, "Price must be greater than 0"),
  categoryId: z.string().min(1, "Category is required"),
  isBestseller: z.boolean(),
  isNew: z.boolean(),
  isAvailable: z.boolean(),
  imageUrls: z.array(z.string()),
});

export type MenuItemFormData = z.infer<typeof menuItemSchema>;

// ── Default Values ─────────────────────────────────

export const menuItemDefaultValues: MenuItemFormData = {
  name: "",
  description: "",
  basePrice: 0,
  categoryId: "",
  isBestseller: false,
  isNew: false,
  isAvailable: true,
  imageUrls: [],
};

// ── Fields Config ──────────────────────────────────

export const menuItemFields = (categories: Category[]): FieldConfig[] => [
  {
    name: "name",
    label: "Item Name",
    type: "text",
    placeholder: "e.g. Chicken Karahi",
  },
  {
    name: "description",
    label: "Description",
    type: "textarea",
    placeholder: "Describe the item...",
    rows: 3,
  },
  {
    name: "categoryId",
    label: "Category",
    type: "select",
    placeholder: "Select category",
    options: categories.map((c) => ({ label: c.name, value: c.id })),
  },
  {
    name: "basePrice",
    label: "Base Price (Rs.)",
    type: "number",
    placeholder: "1200",
  },
  {
    name: "isAvailable",
    label: "Available",
    type: "switch",
    description: "Toggle availability without deleting",
  },
  {
    name: "isBestseller",
    label: "Bestseller",
    type: "switch",
    description: "Show bestseller badge on this item",
  },
  {
    name: "isNew",
    label: "New Arrival",
    type: "switch",
    description: "Show new badge on this item",
  },
];

// ── Table Columns ──────────────────────────────────

export const menuItemColumns = (
  onEdit: (row: MenuItem) => void,
  onDelete: (row: MenuItem) => void,
): ColumnDef<MenuItem>[] => [
  {
    accessorKey: "name",
    header: "Item",
    cell: ({ row }) => {
      const item = row.original;
      const image = item.images[0]?.url;

      return (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg overflow-hidden border border-[#e5e7eb] flex-shrink-0 bg-[#f9fafb]">
            {image ? (
              <Image
                src={image}
                alt={item.name}
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <UtensilsCrossed className="w-4 h-4 text-[#d1d5db]" />
              </div>
            )}
          </div>
          <div>
            <span className="text-sm font-medium text-[#111111]">
              {item.name}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => {
      const item = row.original;
      const categoryName = item.category.name;

      return <span>{categoryName}</span>;
    },
  },
  {
    accessorKey: "basePrice",
    header: "Price",
    cell: ({ row }) => {
      const item = row.original;
      const finalPrice = computeFinalPrice(item.basePrice, item.discounts);
      const hasDiscount = finalPrice !== item.basePrice;

      return (
        <div>
          <span className="text-sm font-semibold text-[#111111]">
            Rs. {finalPrice.toLocaleString()}
          </span>
          {hasDiscount && (
            <p className="text-xs text-[#9ca3af] line-through">
              Rs. {item.basePrice.toLocaleString()}
            </p>
          )}
        </div>
      );
    },
  },
 {
  accessorKey: 'isBestseller',
  header: "is best seller"
 },
  {
    id: "discount",
    header: "Discount",
    cell: ({ row }) => {
      const active = row.original.discounts[0];
      if (!active) return <span className="text-xs text-[#9ca3af]">—</span>;

      const { name, type, value } = active.discount;
      return (
        <div>
          <span className="text-xs font-medium text-[#f97316]">{name}</span>
          <p className="text-xs text-[#9ca3af]">
            {type === "PERCENTAGE" ? `${value}% off` : `Rs. ${value} off`}
          </p>
        </div>
      );
    },
  },
  {
    accessorKey: "isAvailable",
    header: "Status",
    cell: ({ row }) => {
      const available = row.getValue("isAvailable") as boolean;
      return (
        <Badge
          className={
            available
              ? "bg-[#f0fdf4] text-[#16a34a] border border-[#bbf7d0]"
              : "bg-[#fef2f2] text-[#dc2626] border border-[#fecaca]"
          }
        >
          {available ? "Available" : "Unavailable"}
        </Badge>
      );
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
          className="h-8 w-8 bg-transparent text-[#9ca3af] hover:text-[#111111]"
          onClick={() => onEdit(row.original)}
        >
          <Pencil className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 bg-transparent text-[#9ca3af] hover:text-[#dc2626] hover:bg-[#fef2f2]"
          onClick={() => onDelete(row.original)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    ),
  },
];
