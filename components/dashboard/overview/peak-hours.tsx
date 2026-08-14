"use client"

import { useState } from "react"
import { Flame } from "lucide-react"
import { cn } from "@/lib/utils"
import { CardHeading, DashCard, EmptyState } from "./ui"
import { formatCurrency, formatNumber } from "@/lib/utils/format"

type HourBucket = { hour: number; orders: number; revenue: number }

export default function PeakHours({
  hourly,
  busiestHour,
}: {
  hourly: HourBucket[]
  busiestHour: number | null
}) {
  const [hover, setHover] = useState<number | null>(null)

  const max = Math.max(...hourly.map((h) => h.orders), 0)
  const totalOrders = hourly.reduce((acc, h) => acc + h.orders, 0)

  const active = hover !== null ? hourly[hover] : null
  const peak = busiestHour !== null ? hourly[busiestHour] : null

  return (
    <DashCard className="flex flex-col">
      <CardHeading
        icon={Flame}
        title="Peak hours"
        subtitle="When orders actually land — use it to plan shifts"
        action={
          peak ? (
            <span className="text-xs text-soft">
              Busiest{" "}
              <span className="font-medium text-brand">{label(peak.hour)}</span>
            </span>
          ) : null
        }
      />

      {totalOrders === 0 ? (
        <EmptyState
          icon={Flame}
          title="No hourly data yet"
          description="Order timings build up as your day goes on."
          className="flex-1"
        />
      ) : (
        <div className="p-5">
          <div className="flex items-baseline gap-2.5 mb-5 h-5">
            {active ? (
              <>
                <span className="text-sm font-medium text-title">
                  {label(active.hour)}
                </span>
                <span className="text-xs text-soft tabular-nums">
                  {formatNumber(active.orders)} order
                  {active.orders === 1 ? "" : "s"} ·{" "}
                  {formatCurrency(active.revenue)}
                </span>
              </>
            ) : (
              <span className="text-xs text-soft">
                Hover a bar to inspect that hour
              </span>
            )}
          </div>

          <div
            className="flex items-end gap-[3px] h-40"
            onMouseLeave={() => setHover(null)}
          >
            {hourly.map((bucket, i) => {
              const height = max > 0 ? (bucket.orders / max) * 100 : 0
              const isPeak = i === busiestHour && bucket.orders > 0
              const isHover = hover === i

              return (
                <button
                  key={bucket.hour}
                  type="button"
                  onMouseEnter={() => setHover(i)}
                  onFocus={() => setHover(i)}
                  aria-label={`${label(bucket.hour)}: ${bucket.orders} orders`}
                  className="flex-1 h-full flex items-end group cursor-default"
                >
                  {/* Neutral bars keep the orange meaningful: it marks the peak. */}
                  <div
                    className={cn(
                      "w-full rounded-t-[2px] transition-colors duration-150 min-h-[2px]",
                      isHover
                        ? "bg-title"
                        : isPeak
                          ? "bg-brand"
                          : bucket.orders > 0
                            ? "bg-[#dfe3e8] group-hover:bg-[#c7cdd6]"
                            : "bg-[#f1f2f4]",
                    )}
                    style={{ height: `${Math.max(height, bucket.orders > 0 ? 4 : 2)}%` }}
                  />
                </button>
              )
            })}
          </div>

          <div className="flex mt-2.5">
            {hourly.map((bucket, i) => (
              <span
                key={bucket.hour}
                className={cn(
                  "flex-1 text-center text-[10px] text-soft tabular-nums",
                  i % 3 === 0 ? "" : "invisible",
                )}
              >
                {shortLabel(bucket.hour)}
              </span>
            ))}
          </div>
        </div>
      )}
    </DashCard>
  )
}

function label(hour: number) {
  const suffix = hour < 12 ? "AM" : "PM"
  const h = hour % 12 === 0 ? 12 : hour % 12
  return `${h} ${suffix}`
}

function shortLabel(hour: number) {
  const suffix = hour < 12 ? "a" : "p"
  const h = hour % 12 === 0 ? 12 : hour % 12
  return `${h}${suffix}`
}
