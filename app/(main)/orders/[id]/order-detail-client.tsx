"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { updateOrderStatus } from "@/lib/actions/orders/orders"
import { ArrowLeft, Phone, MapPin, Clock, UtensilsCrossed } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"

// ── Status flow ────────────────────────────────────

const statusFlow: Record<string, { next: string; label: string; color: string } | null> = {
  NEW:       { next: "CONFIRMED", label: "Confirm Order",   color: "bg-[#7c3aed] hover:bg-[#6d28d9]" },
  CONFIRMED: { next: "PREPARING", label: "Start Preparing", color: "bg-[#ca8a04] hover:bg-[#a16207]" },
  PREPARING: { next: "READY",     label: "Mark as Ready",   color: "bg-[#f97316] hover:bg-[#ea6c0a]" },
  READY:     { next: "COMPLETED", label: "Complete Order",  color: "bg-[#16a34a] hover:bg-[#15803d]" },
  COMPLETED: null,
  CANCELLED: null,
}

const statusConfig: Record<string, { label: string; color: string }> = {
  NEW:       { label: "New",       color: "bg-[#eff6ff] text-[#2563eb] border-[#bfdbfe]" },
  CONFIRMED: { label: "Confirmed", color: "bg-[#f5f3ff] text-[#7c3aed] border-[#ddd6fe]" },
  PREPARING: { label: "Preparing", color: "bg-[#fefce8] text-[#ca8a04] border-[#fde68a]" },
  READY:     { label: "Ready",     color: "bg-[#fff7ed] text-[#f97316] border-[#fed7aa]" },
  COMPLETED: { label: "Completed", color: "bg-[#f0fdf4] text-[#16a34a] border-[#bbf7d0]" },
  CANCELLED: { label: "Cancelled", color: "bg-[#fef2f2] text-[#dc2626] border-[#fecaca]" },
}

export default function OrderDetailClient({ order }: { order: any }) {
  const router = useRouter()
  const [currentStatus, setCurrentStatus] = useState(order.status)
  const [isPending, startTransition] = useTransition()

  const nextAction = statusFlow[currentStatus]

  function handleStatusUpdate() {
    if (!nextAction) return
    startTransition(async () => {
      const result = await updateOrderStatus(order.id, nextAction.next as any)
      if (result?.success) {
        setCurrentStatus(nextAction.next)
        toast.success(result.message)
      } else {
        toast.error("Failed to update status")
      }
    })
  }

  function handleCancel() {
    startTransition(async () => {
      const result = await updateOrderStatus(order.id, "CANCELLED" as any)
      if (result?.success) {
        setCurrentStatus("CANCELLED")
        toast.success("Order cancelled")
      }
    })
  }

  return (
    <div className="space-y-6 max-w-4xl">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={{ pathname: "/orders" }}>
            <Button variant="ghost" size="icon" className="w-8 h-8">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-[#111111]">
              Order #{order.orderNumber}
            </h1>
            <p className="text-sm text-[#6b7280] mt-0.5">
              {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Status badge */}
        <span className={`
          text-sm font-medium px-3 py-1.5 rounded-full border
          ${statusConfig[currentStatus]?.color}
        `}>
          {statusConfig[currentStatus]?.label}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4">

        {/* Left — Order details */}
        <div className="col-span-2 space-y-4">

          {/* Customer info */}
          <div className="bg-white border border-[#e5e7eb] rounded-xl p-4">
            <h2 className="text-sm font-semibold text-[#111111] mb-3">
              Customer Information
            </h2>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-[#6b7280]">
                <span className="font-medium text-[#111111]">
                  {order.customerName}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#6b7280]">
                <Phone className="w-3.5 h-3.5" />
                {order.customerPhone}
              </div>
              {order.customerAddress && (
                <div className="flex items-center gap-2 text-sm text-[#6b7280]">
                  <MapPin className="w-3.5 h-3.5" />
                  {order.customerAddress}
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-[#6b7280]">
                <UtensilsCrossed className="w-3.5 h-3.5" />
                {order.type === "DINE_IN" ? "Dine In"
                  : order.type === "TAKEAWAY" ? "Takeaway"
                  : "Delivery"}
              </div>
            </div>
          </div>

          {/* Order items */}
          <div className="bg-white border border-[#e5e7eb] rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-[#f3f4f6]">
              <h2 className="text-sm font-semibold text-[#111111]">
                Order Items
              </h2>
            </div>
            <div className="divide-y divide-[#f3f4f6]">
              {order.items.map((item: any) => (
                <div key={item.id} className="px-4 py-3 flex items-start gap-3">

                  {/* Item image */}
                  <div className="w-10 h-10 rounded-lg overflow-hidden border border-[#e5e7eb] bg-[#f9fafb] flex-shrink-0">
                    {item.menuItem.images?.[0]?.url ? (
                      <Image
                        src={item.menuItem.images[0].url}
                        alt={item.menuItem.name}
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

                  {/* Item details */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-[#111111]">
                        {item.menuItem.name}
                        <span className="text-[#9ca3af] ml-1">×{item.quantity}</span>
                      </p>
                      <p className="text-sm font-semibold text-[#111111]">
                        Rs. {item.totalPrice.toLocaleString()}
                      </p>
                    </div>

                    {/* Variant */}
                    {item.variant && (
                      <p className="text-xs text-[#6b7280] mt-0.5">
                        {item.variant.name} — Rs. {item.variant.price}
                      </p>
                    )}

                    {/* Addons */}
                    {item.addons.length > 0 && (
                      <div className="mt-1 space-y-0.5">
                        {item.addons.map((addon: any) => (
                          <p key={addon.id} className="text-xs text-[#9ca3af]">
                            + {addon.name}
                            {addon.price > 0 && ` (Rs. ${addon.price})`}
                          </p>
                        ))}
                      </div>
                    )}

                    {/* Special instructions */}
                    {item.specialInstructions && (
                      <p className="text-xs text-[#f97316] mt-1 bg-[#fff7ed] px-2 py-1 rounded">
                        Note: {item.specialInstructions}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Special notes */}
          {order.specialNotes && (
            <div className="bg-[#fff7ed] border border-[#fed7aa] rounded-xl p-4">
              <p className="text-sm font-medium text-[#f97316] mb-1">
                Special Notes
              </p>
              <p className="text-sm text-[#111111]">{order.specialNotes}</p>
            </div>
          )}

        </div>

        {/* Right — Summary and actions */}
        <div className="space-y-4">

          {/* Order summary */}
          <div className="bg-white border border-[#e5e7eb] rounded-xl p-4">
            <h2 className="text-sm font-semibold text-[#111111] mb-3">
              Order Summary
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-[#6b7280]">
                <span>Subtotal</span>
                <span>Rs. {order.subtotal.toLocaleString()}</span>
              </div>
              {order.deliveryFee > 0 && (
                <div className="flex justify-between text-sm text-[#6b7280]">
                  <span>Delivery Fee</span>
                  <span>Rs. {order.deliveryFee.toLocaleString()}</span>
                </div>
              )}
              {order.discount > 0 && (
                <div className="flex justify-between text-sm text-[#16a34a]">
                  <span>Discount</span>
                  <span>- Rs. {order.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="border-t border-[#f3f4f6] pt-2 flex justify-between text-sm font-semibold text-[#111111]">
                <span>Total</span>
                <span>Rs. {order.total.toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-[#f3f4f6]">
              <div className="flex justify-between text-sm">
                <span className="text-[#6b7280]">Payment</span>
                <span className={`font-medium ${
                  order.paymentStatus === "PAID"
                    ? "text-[#16a34a]"
                    : "text-[#ca8a04]"
                }`}>
                  {order.paymentMethod} — {order.paymentStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Status actions */}
          <div className="bg-white border border-[#e5e7eb] rounded-xl p-4 space-y-2">
            <h2 className="text-sm font-semibold text-[#111111] mb-3">
              Actions
            </h2>

            {/* Next status button */}
            {nextAction && (
              <Button
                onClick={handleStatusUpdate}
                disabled={isPending}
                className={`w-full text-white ${nextAction.color}`}
              >
                {isPending ? "Updating..." : nextAction.label}
              </Button>
            )}

            {/* Cancel button */}
            {currentStatus !== "COMPLETED" && currentStatus !== "CANCELLED" && (
              <Button
                onClick={handleCancel}
                disabled={isPending}
                variant="outline"
                className="w-full border-[#fecaca] text-[#dc2626] hover:bg-[#fef2f2]"
              >
                Cancel Order
              </Button>
            )}

            {currentStatus === "COMPLETED" && (
              <p className="text-center text-sm text-[#16a34a] font-medium">
                ✓ Order completed
              </p>
            )}

            {currentStatus === "CANCELLED" && (
              <p className="text-center text-sm text-[#dc2626] font-medium">
                ✗ Order cancelled
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}