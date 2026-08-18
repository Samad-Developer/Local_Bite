import { Wallet } from "lucide-react"
import {
  CardHeading,
  DashCard,
  EmptyState,
  MicroLabel,
  PAYMENT_COLORS,
  STATUS,
  ShareBar,
  slotColor,
} from "./ui"
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils/format"
import type { BreakdownSlice } from "@/types/dashboard.types"

export default function PaymentMix({
  slices,
  collected,
  outstanding,
}: {
  slices: BreakdownSlice[]
  collected: number
  outstanding: number
}) {
  const total = collected + outstanding
  const collectedShare = total > 0 ? (collected / total) * 100 : 0

  return (
    <DashCard className="flex flex-col">
      <CardHeading
        icon={Wallet}
        title="Payments"
        subtitle="How customers are paying, and what is still owed"
      />

      {slices.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="No payments recorded"
          description="Payment breakdown shows up with your first order."
          className="flex-1"
        />
      ) : (
        <div className="p-5 space-y-6">
          <div>
            <div className="flex items-baseline justify-between mb-3">
              <span className="text-[28px] font-semibold text-title tracking-tight leading-none">
                {formatCurrency(collected)}
              </span>
              <span className="text-xs text-soft tabular-nums">
                {formatPercent(collectedShare, 0)} of billed
              </span>
            </div>

            <div className="h-2 rounded-full bg-[#f1f2f4] overflow-hidden flex gap-[2px]">
              <div
                className="h-full rounded-full transition-[width] duration-700 ease-out"
                style={{
                  width: `${collectedShare}%`,
                  backgroundColor: STATUS.good,
                }}
              />
              <div
                className="h-full rounded-full transition-[width] duration-700 ease-out"
                style={{
                  width: `${100 - collectedShare}%`,
                  backgroundColor: STATUS.warn,
                }}
              />
            </div>

            <div className="flex items-center justify-between mt-2.5 text-xs">
              <span className="inline-flex items-center gap-1.5 text-label">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: STATUS.good }}
                />
                Collected
              </span>
              <span className="inline-flex items-center gap-1.5 text-label tabular-nums">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: STATUS.warn }}
                />
                {formatCurrency(outstanding)} pending
              </span>
            </div>
          </div>

          <div className="pt-5 border-t border-border space-y-4">
            <MicroLabel>By method</MicroLabel>

            {slices.map((slice, i) => {
              const color = PAYMENT_COLORS[slice.key] ?? slotColor(i)

              return (
                <div key={slice.key} className="group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center gap-2 text-sm text-title">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      {slice.label}
                    </span>
                    <span className="text-sm font-medium text-title tabular-nums">
                      {formatCurrency(slice.revenue)}
                    </span>
                  </div>
                  <ShareBar value={slice.share} color={color} />
                  <p className="text-xs text-soft mt-2">
                    {formatNumber(slice.orders)} order
                    {slice.orders === 1 ? "" : "s"} ·{" "}
                    {formatPercent(slice.share, 0)} of revenue
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </DashCard>
  )
}
