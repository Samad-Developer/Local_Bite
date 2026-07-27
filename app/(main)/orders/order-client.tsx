"use client"

import { toast } from "sonner"
import { useEffect, useMemo, useState } from "react"
import { DataTable } from "@/components/shared/DataTable"
import { columns, type Order, filterTabs } from "./config"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useOrderNotification } from "@/components/providers/order-notification-provider"

export default function OrdersRealtime({
  initialOrders,
}: {
  initialOrders: Order[]
}) {
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [statusFilter, setStatusFilter] = useState<string>("")

  // Apna subscription nahi — Provider ka data consume kar rahe hain
  const { lastOrderChange, clearLastOrderChange } = useOrderNotification()

  // Jab bhi Provider mein naya change aaye, table update karo
  useEffect(() => {
    if (!lastOrderChange) return

    const { eventType, order } = lastOrderChange

    if (eventType === "INSERT") {
      const newOrder = order as Order
      setOrders((prev) => {
        // Duplicate se bachne ke liye check
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

  return (
    <div className="space-y-6">

      <Tabs value={statusFilter} onValueChange={setStatusFilter}>
        <TabsList variant="line">
          {filterTabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="px-3 cursor-pointer">
              {tab.label}
              {tab.value === "NEW" && (
                <span className="ml-1.5 bg-[#f97316] text-white text-xs px-1.5 py-0.5 rounded-full">
                  {orders.filter((o) => o.status === "NEW").length}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <DataTable columns={columns} data={filteredOrders} pageSize={10} searchKey="customerName" />
    </div>
  )
}