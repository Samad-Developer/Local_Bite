import { z } from "zod"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, LayoutGrid } from "lucide-react"
import { FieldConfig } from "@/components/shared/form/field-config.types"

// ── Type ───────────────────────────────────────────

export type Category = {
  id: string
  name: string
  sortOrder: number
  isVisible: boolean
  _count: { menuItems: number }
}

// ── Schema ─────────────────────────────────────────

export const categorySchema = z.object({
  name: z.string().min(1, "Category name is required").max(50, "Name too long"),
  sortOrder: z.coerce.number().min(0, "Must be 0 or greater"),
  isVisible: z.boolean(),
})

export type CategoryFormData = z.infer<typeof categorySchema>

// ── Default Values ─────────────────────────────────

export const categoryDefaultValues: CategoryFormData = {
  name: "",
  sortOrder: 0,
  isVisible: true,
}

// ── Fields Config (drives FormRenderer) ────────────

export const categoryFields: FieldConfig[] = [
  {
    name: "name",
    label: "Category Name",
    type: "text",
    placeholder: "e.g. Starters, Mains, Drinks",
  },
  {
    name: "sortOrder",
    label: "Sort Order",
    type: "number",
    placeholder: "0",
    description: "Lower numbers appear first on the menu",
  },
  {
    name: "isVisible",
    label: "Visible to Customers",
    type: "switch",
    description: "Hide this category without deleting it",
  },
]

// ── Table Columns ───────────────────────────────────

export const categoryColumns = (
  onEdit: (row: Category) => void,
  onDelete: (row: Category) => void,
): ColumnDef<Category>[] => [
  {
    accessorKey: "name",
    header: () => <div className="py-3 px-2">Name</div>,
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#fff7ed] flex items-center justify-center">
          <LayoutGrid className="w-4 h-4 text-[#f97316]" />
        </div>
        <span className="text-sm font-medium text-[#111111]">
          {row.getValue("name") as string}
        </span>
      </div>
    ),
  },
  {
    id: "items",
    header: "Items",
    cell: ({ row }) => {
      const count = row.original._count.menuItems
      return (
        <span className="text-sm text-[#6b7280]">
          {count} {count === 1 ? "item" : "items"}
        </span>
      )
    },
  },
  {
    accessorKey: "sortOrder",
    header: "Sort Order",
    cell: ({ row }) => (
      <span className="text-sm text-[#6b7280]">
        {row.getValue("sortOrder") as number}
      </span>
    ),
  },
  {
    accessorKey: "isVisible",
    header: "Visibility",
    cell: ({ row }) => {
      const visible = row.getValue("isVisible") as boolean
      return (
        <Badge
          variant={visible ? "default" : "secondary"}
          className={visible
            ? "bg-[#f0fdf4] text-[#16a34a] border border-[#bbf7d0]"
            : "bg-[#f9fafb] text-[#6b7280] border border-[#e5e7eb]"
          }
        >
          {visible ? "Visible" : "Hidden"}
        </Badge>
      )
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right py-3 px-2">Actions</div>,
    cell: ({ row }) => (
      <div className="flex items-center justify-end gap-1">
        <Button
          variant="secondary"
          size="icon"
          className="h-8 w-8 bg-transparent text-[#9ca3af] hover:text-[#111111]"
          onClick={() => onEdit(row.original)}
        >
          <Pencil className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 bg-transparent text-[#dc2626] hover:bg-[#fef2f2]"
          onClick={() => onDelete(row.original)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    ),
  },
]