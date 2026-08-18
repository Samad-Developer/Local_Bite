"use client"

import { toast } from "sonner"
import { useEffect, useMemo, useState } from "react"
import { DataTable } from "@/components/shared/DataTable"
import { columns, filterTabs, type Order } from "./config"
import OrdersHeader from "./orders-header"
import OrderFilters from "./order-filters"
import { useOrderNotification } from "@/components/providers/order-notification-provider"

export default function OrdersRealtime({
  initialOrders,
}: {
  initialOrders: Order[]
}) {
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [statusFilter, setStatusFilter] = useState<string>("")

  const { lastOrderChange, clearLastOrderChange } = useOrderNotification()

  useEffect(() => {
    if (!lastOrderChange) return

    const { eventType, order } = lastOrderChange

    if (eventType === "INSERT") {
      const newOrder = order as Order
      setOrders((prev) => {
        if (prev.some((o) => o.id === newOrder.id)) return prev
        return [newOrder, ...prev]
      })
      toast.success(
        `New order #${newOrder.orderNumber} from ${newOrder.customerName}`,
        { duration: 8000, position: "top-right" }
      )
    }

    if (eventType === "UPDATE") {
      const updatedOrder = order as Order
      setOrders((prev) =>
        prev.map((o) => (o.id === updatedOrder.id ? { ...o, ...updatedOrder } : o))
      )
    }

    if (eventType === "DELETE") {
      const deletedOrder = order as Order
      setOrders((prev) => prev.filter((o) => o.id !== deletedOrder.id))
    }

    clearLastOrderChange();
  }, [lastOrderChange])

  const filteredOrders = useMemo(() => {
    return statusFilter ? orders.filter((o) => o.status === statusFilter) : orders
  }, [orders, statusFilter])

  const counts = useMemo(() => {
    const result: Record<string, number> = { "": orders.length }
    for (const tab of filterTabs) {
      if (tab.value) result[tab.value] = 0
    }
    for (const order of orders) {
      if (order.status in result) result[order.status] += 1
    }
    return result
  }, [orders])

  return (
    <div className="space-y-4">
      <OrdersHeader orders={orders} />

      <DataTable
        columns={columns}
        data={filteredOrders}
        pageSize={10}
        searchKey="customerName"
        toolbar={
          <OrderFilters
            value={statusFilter}
            onChange={setStatusFilter}
            counts={counts}
          />
        }
      />
    </div>
  )
}
