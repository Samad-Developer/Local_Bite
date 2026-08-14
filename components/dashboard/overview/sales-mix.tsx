import { PieChart } from "lucide-react"
import { CardHeading, DashCard, EmptyState, TYPE_COLORS } from "./ui"
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils/format"
import type { BreakdownSlice } from "@/types/dashboard.types"

const FALLBACK_COLORS = ["#f97316", "#1f2937", "#6b7280", "#0ea5e9", "#16a34a"]

export default function SalesMix({ slices }: { slices: BreakdownSlice[] }) {
  const total = slices.reduce((acc, s) => acc + s.revenue, 0)
  const totalOrders = slices.reduce((acc, s) => acc + s.orders, 0)

  return (
    <DashCard className="flex flex-col">
      <CardHeading
        icon={PieChart}
        title="Sales channels"
        subtitle="Where the money comes from"
      />

      {total === 0 ? (
        <EmptyState
          icon={PieChart}
          title="No channel data"
          description="Revenue split appears once orders are placed."
          className="flex-1"
        />
      ) : (
        <div className="p-5 flex flex-col items-center">
          <Donut
            slices={slices}
            total={total}
            centerValue={formatCurrency(total)}
            centerLabel={`${formatNumber(totalOrders)} orders`}
          />

          <div className="w-full mt-6 space-y-3.5">
            {slices.map((slice, i) => (
              <div key={slice.key} className="flex items-center gap-3">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{
                    backgroundColor:
                      TYPE_COLORS[slice.key] ??
                      FALLBACK_COLORS[i % FALLBACK_COLORS.length],
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-title truncate">{slice.label}</p>
                  <p className="text-xs text-soft mt-0.5">
                    {formatNumber(slice.orders)} order
                    {slice.orders === 1 ? "" : "s"} · avg{" "}
                    {formatCurrency(slice.revenue / Math.max(1, slice.orders))}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-medium text-title tabular-nums">
                    {formatCurrency(slice.revenue)}
                  </p>
                  <p className="text-xs text-soft tabular-nums mt-0.5">
                    {formatPercent(slice.share, 0)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashCard>
  )
}

// ─── Donut ────────────────────────────────────────────

export function Donut({
  slices,
  total,
  centerValue,
  centerLabel,
  colors = TYPE_COLORS,
}: {
  slices: BreakdownSlice[]
  total: number
  centerValue: string
  centerLabel: string
  colors?: Record<string, string>
}) {
  const radius = 54
  const circumference = 2 * Math.PI * radius

  // Pre-compute each arc's length and starting offset so the render stays pure.
  const arcs = slices.reduce<{ slice: BreakdownSlice; length: number; offset: number }[]>(
    (acc, slice) => {
      const fraction = total > 0 ? slice.revenue / total : 0
      const length = fraction * circumference
      const offset = acc.length ? acc[acc.length - 1].offset + acc[acc.length - 1].length : 0
      acc.push({ slice, length, offset })
      return acc
    },
    [],
  )

  return (
    <div className="relative w-[164px] h-[164px]">
      <svg viewBox="0 0 128 128" className="w-full h-full -rotate-90">
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          stroke="#f1f2f4"
          strokeWidth="11"
        />
        {arcs.map(({ slice, length, offset }, i) => (
          <circle
            key={slice.key}
            cx="64"
            cy="64"
            r={radius}
            fill="none"
            stroke={colors[slice.key] ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length]}
            strokeWidth="11"
            strokeDasharray={`${length} ${circumference - length}`}
            strokeDashoffset={-offset}
            strokeLinecap="butt"
          />
        ))}
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8">
        <span className="text-base font-semibold text-title tabular-nums leading-tight">
          {centerValue}
        </span>
        <span className="text-[11px] text-soft mt-1">{centerLabel}</span>
      </div>
    </div>
  )
}
