"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import Link from "next/link"
import { Route } from "next"

// ── Types ──────────────────────────────────────────

export type Order = {
  id: string
  orderNumber: number
  customerName: string
  customerPhone: string
  type: string
  status: string
  paymentMethod: string
  paymentStatus: string
  subtotal: number
  deliveryFee: number
  total: number
  specialNotes: string | null
  createdAt: string
  restaurantId: string
  items?: any[]
}

// filter tabs

export const filterTabs = [
  { label: "All", value: "" },
  { label: "New", value: "NEW" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Preparing", value: "PREPARING" },
  { label: "Ready", value: "READY" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Cancelled", value: "CANCELLED" },
]

// ── Status config (yahan bhi chahiye kyunki isi file mein use ho rahi hai) ──

export const statusConfig: Record<string, { label: string; color: string }> = {
  NEW: { label: "New", color: "bg-[#eff6ff] text-[#2563eb] border-[#bfdbfe]" },
  CONFIRMED: { label: "Confirmed", color: "bg-[#f5f3ff] text-[#7c3aed] border-[#ddd6fe]" },
  PREPARING: { label: "Preparing", color: "bg-[#fefce8] text-[#ca8a04] border-[#fde68a]" },
  READY: { label: "Ready", color: "bg-[#fff7ed] text-[#f97316] border-[#fed7aa]" },
  COMPLETED: { label: "Completed", color: "bg-[#f0fdf4] text-[#16a34a] border-[#bbf7d0]" },
  CANCELLED: { label: "Cancelled", color: "bg-[#fef2f2] text-[#dc2626] border-[#fecaca]" },
}

// ── Helper function (component se bahar hai to yahan bhi honi chahiye) ──

function formatTime(date: string) {
  const now = new Date()
  const diff = Math.floor((now.getTime() - new Date(date).getTime()) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  return `${Math.floor(diff / 3600)}h ago`
}

// ── Columns — function ke roop mein export karo (router hook ke liye) ──
// "router" ek React hook se aata hai, isliye ise directly module-level
// array mein use nahi kar sakte. Iska fix: columns ko function banao
// jo component ke andar call ho, ya action wale column mein useRouter
// ki jagah plain <Link> use karo (recommended, simpler).

export const columns: ColumnDef<Order>[] = [
  {
    accessorKey: "orderNumber",
    header: "Order",
    cell: ({ row }) => (
      <span className="text-sm font-semibold text-[#111111]">
        #{row.original.orderNumber}
      </span>
    ),
  },
  {
    accessorKey: "customerName",
    header: "Customer",
    cell: ({ row }) => (
      <div>
        <p className="text-sm font-medium text-[#111111]">
          {row.original.customerName}
        </p>
        <p className="text-xs text-[#9ca3af]">{row.original.customerPhone}</p>
      </div>
    ),
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.original.type
      return (
        <span className="text-sm text-[#6b7280]">
          {type === "DINE_IN" ? "Dine In" : type === "TAKEAWAY" ? "Takeaway" : "Delivery"}
        </span>
      )
    },
  },
  {
    id: "items",
    header: "Items",
    cell: ({ row }) => (
      <span className="text-sm text-[#6b7280]">
        {row.original.items?.length ?? 0} items
      </span>
    ),
  },
  {
    accessorKey: "total",
    header: "Total",
    cell: ({ row }) => (
      <span className="text-sm font-semibold text-[#111111]">
        Rs. {row.original.total.toLocaleString()}
      </span>
    ),
  },
  {
    accessorKey: "paymentStatus",
    header: "Payment",
    cell: ({ row }) => {
      const paid = row.original.paymentStatus === "PAID"
      return (
        <Badge
          className={
            paid
              ? "bg-[#f0fdf4] text-[#16a34a] border border-[#bbf7d0]"
              : "bg-[#fefce8] text-[#ca8a04] border border-[#fde68a]"
          }
        >
          {paid ? "Paid" : "Pending"}
        </Badge>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status
      return (
        <Badge className={statusConfig[status]?.color}>
          {statusConfig[status]?.label}
        </Badge>
      )
    },
  },
  {
    accessorKey: "createdAt",
    header: "Time",
    cell: ({ row }) => (
      <span className="text-xs text-[#9ca3af]">
        {formatTime(row.original.createdAt)}
      </span>
    ),
  },
   {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => (
      <div className="flex items-center justify-end">
        <Link href={`/orders/${row.original.id}` as Route}>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 bg-transparent text-[#9ca3af] hover:text-[#111111]"
          >
            <Eye className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    ),
  },
]