import { z } from "zod"
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, MapPin } from "lucide-react"
import { FieldConfig } from "@/components/shared/form/field-config.types"

// ── Type ───────────────────────────────────────────

export type DeliveryArea = {
  id: string
  name: string
  deliveryFee: number
  isActive: boolean
  sortOrder: number
  restaurantId: string
  createdAt: Date
  updatedAt: Date
}

// ── Schema ─────────────────────────────────────────

export const deliveryAreaSchema = z.object({
  name: z.string().min(1, "Area name is required").max(50),
  deliveryFee: z.coerce.number().min(0, "Delivery fee cannot be negative"),
  isActive: z.boolean(),
})

export type DeliveryAreaFormData = z.infer<typeof deliveryAreaSchema>

// ── Default values ─────────────────────────────────

export const deliveryAreaDefaultValues: DeliveryAreaFormData = {
  name: "",
  deliveryFee: 0,
  isActive: true,
}

// ── Fields ─────────────────────────────────────────

export const deliveryAreaFields: FieldConfig[] = [
  {
    name: "name",
    label: "Area Name",
    type: "text",
    placeholder: "e.g. DHA, Gulberg, Model Town",
  },
  {
    name: "deliveryFee",
    label: "Delivery Fee (Rs.)",
    type: "number",
    placeholder: "50",
  },
  {
    name: "isActive",
    label: "Active",
    type: "switch",
    description: "Disable to temporarily stop delivery to this area",
  },
]

// ── Columns ────────────────────────────────────────

export const deliveryAreaColumns = (
  onEdit: (row: DeliveryArea) => void,
  onDelete: (row: DeliveryArea) => void,
): ColumnDef<DeliveryArea>[] => [
  {
    accessorKey: "name",
    header: "Area",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-[#eff6ff] flex items-center justify-center">
          <MapPin className="w-3.5 h-3.5 text-[#2563eb]" />
        </div>
        <span className="text-sm font-medium text-[#111111]">
          {row.original.name}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "deliveryFee",
    header: "Delivery Fee",
    cell: ({ row }) => (
      <span className="text-sm text-[#111111]">
        Rs. {row.original.deliveryFee.toLocaleString()}
      </span>
    ),
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => (
      <span className={`
        text-xs font-medium px-2.5 py-0.5 rounded-full border
        ${row.original.isActive
          ? "bg-[#f0fdf4] text-[#16a34a] border-[#bbf7d0]"
          : "bg-[#fef2f2] text-[#dc2626] border-[#fecaca]"
        }
      `}>
        {row.original.isActive ? "Active" : "Inactive"}
      </span>
    ),
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