import { Wallet } from "lucide-react"
import { CardHeading, DashCard, EmptyState, MicroLabel, ShareBar } from "./ui"
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils/format"
import type { BreakdownSlice } from "@/types/dashboard.types"

const METHOD_COLORS: Record<string, string> = {
  CASH: "#1f2937",
  CARD: "#6b7280",
  ONLINE: "#f97316",
}

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
          {/* ── Collected vs outstanding ── */}
          <div>
            <div className="flex items-baseline justify-between mb-3">
              <span className="text-2xl font-semibold text-title tracking-tight tabular-nums">
                {formatCurrency(collected)}
              </span>
              <span className="text-xs text-soft tabular-nums">
                {formatPercent(collectedShare, 0)} of billed
              </span>
            </div>

            <div className="h-1.5 rounded-full bg-[#f1f2f4] overflow-hidden flex">
              <div
                className="h-full bg-[#16a34a] transition-all duration-500"
                style={{ width: `${collectedShare}%` }}
              />
              <div
                className="h-full bg-[#fbbf24] transition-all duration-500"
                style={{ width: `${100 - collectedShare}%` }}
              />
            </div>

            <div className="flex items-center justify-between mt-2.5 text-xs">
              <span className="inline-flex items-center gap-1.5 text-label">
                <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a]" />
                Collected
              </span>
              <span className="inline-flex items-center gap-1.5 text-label tabular-nums">
                <span className="w-1.5 h-1.5 rounded-full bg-[#fbbf24]" />
                {formatCurrency(outstanding)} pending
              </span>
            </div>
          </div>

          {/* ── Method split ── */}
          <div className="pt-5 border-t border-border space-y-4">
            <MicroLabel>By method</MicroLabel>

            {slices.map((slice) => (
              <div key={slice.key}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-title">{slice.label}</span>
                  <span className="text-sm font-medium text-title tabular-nums">
                    {formatCurrency(slice.revenue)}
                  </span>
                </div>
                <ShareBar
                  value={slice.share}
                  color={METHOD_COLORS[slice.key] ?? "#f97316"}
                />
                <p className="text-xs text-soft mt-2">
                  {formatNumber(slice.orders)} order
                  {slice.orders === 1 ? "" : "s"} · {formatPercent(slice.share, 0)} of
                  revenue
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashCard>
  )
}
