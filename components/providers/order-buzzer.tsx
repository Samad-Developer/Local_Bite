"use client"

import { useOrderNotification } from "./order-notification-provider"
import { Button } from "@/components/ui/button"
import { Bell } from "lucide-react"
import { Route } from "next"
import { useRouter } from "next/navigation"

export function OrderBuzzer() {
  const { activeOrder, dismissBuzzer } = useOrderNotification()
  const router = useRouter()

  if (!activeOrder) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center animate-bounce-in">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#fff7ed] flex items-center justify-center animate-pulse">
          <Bell className="w-8 h-8 text-[#f97316]" />
        </div>

        <h2 className="text-xl font-bold text-[#111111] mb-1">
          New Order #{activeOrder.orderNumber}
        </h2>
        <p className="text-sm text-[#6b7280] mb-1">{activeOrder.customerName}</p>
        <p className="text-lg font-semibold text-[#f97316] mb-6">
          Rs. {activeOrder.total.toLocaleString()}
        </p>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={dismissBuzzer}>
            Dismiss
          </Button>
          <Button
            className="flex-1 bg-[#f97316] hover:bg-[#ea580c]"
            onClick={() => {
              router.push(`/orders/${activeOrder.id}` as Route)
              dismissBuzzer()
            }}
          >
            View Order
          </Button>
        </div>
      </div>
    </div>
  )
}