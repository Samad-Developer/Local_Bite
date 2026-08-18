"use client"

import { useState } from "react"
import { PieChart } from "lucide-react"
import { cn } from "@/lib/utils"
import { CardHeading, DashCard, EmptyState, TYPE_COLORS, slotColor } from "./ui"
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils/format"
import type { BreakdownSlice } from "@/types/dashboard.types"

export default function SalesMix({ slices }: { slices: BreakdownSlice[] }) {
  const total = slices.reduce((acc, s) => acc + s.revenue, 0)
  const totalOrders = slices.reduce((acc, s) => acc + s.orders, 0)
  const [active, setActive] = useState<string | null>(null)

  const shown = active ? slices.find((s) => s.key === active) : null

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
            active={active}
            onActiveChange={setActive}
            centerValue={
              shown ? formatCurrency(shown.revenue) : formatCurrency(total)
            }
            centerLabel={
              shown
                ? `${shown.label} · ${formatPercent(shown.share, 0)}`
                : `${formatNumber(totalOrders)} orders`
            }
          />

          <ul className="w-full mt-6 space-y-1">
            {slices.map((slice, i) => {
              const color = TYPE_COLORS[slice.key] ?? slotColor(i)
              const dimmed = active !== null && active !== slice.key

              return (
                <li key={slice.key}>
                  <button
                    type="button"
                    onMouseEnter={() => setActive(slice.key)}
                    onMouseLeave={() => setActive(null)}
                    onFocus={() => setActive(slice.key)}
                    onBlur={() => setActive(null)}
                    className={cn(
                      "w-full flex items-center gap-3 text-left rounded-lg px-2 py-2 -mx-2 cursor-default",
                      "transition-[background-color,opacity] duration-200",
                      active === slice.key && "bg-elevated",
                      dimmed && "opacity-45",
                    )}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 transition-transform duration-200"
                      style={{
                        backgroundColor: color,
                        transform: active === slice.key ? "scale(1.35)" : "none",
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
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </DashCard>
  )
}

const RADIUS = 54
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const STROKE = 12

export function Donut({
  slices,
  total,
  centerValue,
  centerLabel,
  colors = TYPE_COLORS,
  active,
  onActiveChange,
}: {
  slices: BreakdownSlice[]
  total: number
  centerValue: string
  centerLabel: string
  colors?: Record<string, string>
  active?: string | null
  onActiveChange?: (key: string | null) => void
}) {
  const arcs = slices.reduce<
    { slice: BreakdownSlice; length: number; offset: number }[]
  >((acc, slice) => {
    const fraction = total > 0 ? slice.revenue / total : 0
    const length = Math.max(0, fraction * CIRCUMFERENCE - 2)
    const offset = acc.length
      ? acc[acc.length - 1].offset + (acc[acc.length - 1].length + 2)
      : 0
    acc.push({ slice, length, offset })
    return acc
  }, [])

  return (
    <div className="relative w-[172px] h-[172px]">
      <svg
        viewBox="0 0 128 128"
        className="w-full h-full -rotate-90 overflow-visible"
        onMouseLeave={() => onActiveChange?.(null)}
      >
        <circle
          cx="64"
          cy="64"
          r={RADIUS}
          fill="none"
          stroke="#f1f2f4"
          strokeWidth={STROKE}
        />

        {arcs.map(({ slice, length, offset }, i) => {
          const color = colors[slice.key] ?? slotColor(i)
          const isActive = active === slice.key
          const dimmed = active != null && !isActive

          return (
            <circle
              key={slice.key}
              cx="64"
              cy="64"
              r={RADIUS}
              fill="none"
              stroke={color}
              strokeWidth={isActive ? STROKE + 4 : STROKE}
              strokeDasharray={`${length} ${CIRCUMFERENCE}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
              opacity={dimmed ? 0.35 : 1}
              onMouseEnter={() => onActiveChange?.(slice.key)}
              className="donut-arc"
              style={{
                ["--arc-len" as string]: `${length}px`,
                ["--arc-gap" as string]: `${CIRCUMFERENCE}px`,
                ["--arc-delay" as string]: `${i * 110}ms`,
              }}
            />
          )
        })}
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-9 pointer-events-none">
        <span className="text-[17px] font-semibold text-title leading-tight">
          {centerValue}
        </span>
        <span className="text-[11px] text-soft mt-1 leading-tight">
          {centerLabel}
        </span>
      </div>
    </div>
  )
}
