"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import Link from "next/link"
import { Route } from "next"

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

export const filterTabs = [
  { label: "All", value: "" },
  { label: "New", value: "NEW" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Preparing", value: "PREPARING" },
  { label: "Ready", value: "READY" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Cancelled", value: "CANCELLED" },
]

export const ACTIVE_STATUSES = ["NEW", "CONFIRMED", "PREPARING", "READY"]

export const statusConfig: Record<
  string,
  { label: string; color: string; dot: string }
> = {
  NEW: {
    label: "New",
    color: "bg-[#eff6ff] text-[#2563eb] border-[#bfdbfe]",
    dot: "#2563eb",
  },
  CONFIRMED: {
    label: "Confirmed",
    color: "bg-[#f5f3ff] text-[#7c3aed] border-[#ddd6fe]",
    dot: "#7c3aed",
  },
  PREPARING: {
    label: "Preparing",
    color: "bg-[#fefce8] text-[#ca8a04] border-[#fde68a]",
    dot: "#ca8a04",
  },
  READY: {
    label: "Ready",
    color: "bg-[#fff7ed] text-[#f97316] border-[#fed7aa]",
    dot: "#f97316",
  },
  COMPLETED: {
    label: "Completed",
    color: "bg-[#f0fdf4] text-[#16a34a] border-[#bbf7d0]",
    dot: "#16a34a",
  },
  CANCELLED: {
    label: "Cancelled",
    color: "bg-[#fef2f2] text-[#dc2626] border-[#fecaca]",
    dot: "#dc2626",
  },
}

function formatTime(date: string) {
  const now = new Date()
  const diff = Math.floor((now.getTime() - new Date(date).getTime()) / 1000)

  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`

  return new Date(date).toLocaleString()
}

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
        <Link href={`/orders/${row.original.id}` as Route} prefetch={true}>
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
