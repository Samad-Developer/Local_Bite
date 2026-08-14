"use client"

import { useMemo, useState } from "react"
import { CalendarClock } from "lucide-react"
import { cn } from "@/lib/utils"
import { CardHeading, DashCard, EmptyState } from "./ui"
import { formatCurrency, formatNumber } from "@/lib/utils/format"
import type { HeatCell, RushHeatmap } from "@/types/dashboard.types"

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

export default function RushHeatmapCard({ data }: { data: RushHeatmap }) {
  const [hover, setHover] = useState<HeatCell | null>(null)

  const hours = Array.from(
    { length: data.endHour - data.startHour + 1 },
    (_, i) => data.startHour + i,
  )

  // Keyed lookup — the grid renders ~120 cells and scanning the array for
  // each one turns the render quadratic.
  const bySlot = useMemo(() => {
    const map = new Map<string, HeatCell>()
    for (const cell of data.cells) map.set(`${cell.day}:${cell.hour}`, cell)
    return map
  }, [data.cells])

  const subtitle = `Order volume by weekday and hour · last ${data.weeks} weeks`

  if (data.totalOrders === 0) {
    return (
      <DashCard className="flex flex-col">
        <CardHeading icon={CalendarClock} title="Weekly rush" subtitle={subtitle} />
        <EmptyState
          icon={CalendarClock}
          title="Not enough history yet"
          description="After a couple of weeks of trading, your busy shifts will show up here."
          className="flex-1"
        />
      </DashCard>
    )
  }

  // Average per week, because a raw 8-week count means little on its own.
  const perWeek = (cell: HeatCell) => cell.orders / data.weeks
  const shown = hover ?? data.busiest

  return (
    <DashCard className="flex flex-col">
      <CardHeading
        icon={CalendarClock}
        title="Weekly rush"
        subtitle={subtitle}
        action={
          <span className="text-xs text-soft">
            Deepest cell ={" "}
            <span className="font-medium text-title tabular-nums">
              {formatNumber(data.maxOrders)}
            </span>{" "}
            orders
          </span>
        }
      />

      <div className="p-5">
        {/* ── Readout: pinned so the grid never has to host a tooltip ── */}
        <div className="flex items-baseline gap-2.5 mb-4 h-5">
          {shown && (
            <>
              <span className="text-sm font-medium text-title">
                {DAYS[shown.day]} {hourLabel(shown.hour)}
              </span>
              <span className="text-xs text-soft tabular-nums">
                {formatNumber(shown.orders)} order
                {shown.orders === 1 ? "" : "s"} · {perWeek(shown).toFixed(1)}/week ·{" "}
                {formatCurrency(shown.revenue)}
              </span>
              {!hover && (
                <span className="text-xs text-brand font-medium">busiest</span>
              )}
            </>
          )}
        </div>

        {/* ── Grid ── */}
        <div className="overflow-x-auto -mx-1 px-1">
          <div className="min-w-[520px]">
            <div
              className="grid gap-[3px]"
              style={{
                gridTemplateColumns: `2.25rem repeat(${hours.length}, minmax(0, 1fr))`,
              }}
              onMouseLeave={() => setHover(null)}
            >
              {DAYS.map((dayName, day) => (
                <Row key={dayName}>
                  <span className="text-[11px] text-label tabular-nums self-center pr-2">
                    {dayName}
                  </span>

                  {hours.map((hour) => {
                    const cell = bySlot.get(`${day}:${hour}`)
                    const orders = cell?.orders ?? 0
                    const isHover =
                      hover?.day === day && hover?.hour === hour
                    const isPeak =
                      data.busiest?.day === day && data.busiest?.hour === hour

                    return (
                      <button
                        key={hour}
                        type="button"
                        onMouseEnter={() => cell && setHover(cell)}
                        onFocus={() => cell && setHover(cell)}
                        aria-label={`${dayName} ${hourLabel(hour)}: ${orders} orders`}
                        className={cn(
                          "h-7 rounded-[3px] cursor-default transition-shadow duration-100",
                          isHover && "ring-2 ring-title ring-offset-1",
                          !isHover && isPeak && "ring-2 ring-brand ring-offset-1",
                        )}
                        style={{
                          backgroundColor: cellColor(orders, data.maxOrders),
                        }}
                      />
                    )
                  })}
                </Row>
              ))}

              {/* hour axis */}
              <Row>
                <span />
                {hours.map((hour, i) => (
                  <span
                    key={hour}
                    className={cn(
                      "text-[10px] text-soft tabular-nums text-center pt-1.5",
                      i % 2 === 0 ? "" : "invisible",
                    )}
                  >
                    {shortHour(hour)}
                  </span>
                ))}
              </Row>
            </div>
          </div>
        </div>

        {/* ── Scale ── */}
        <div className="flex items-center gap-2 mt-5 pt-4 border-t border-border">
          <span className="text-xs text-soft">Quiet</span>
          <div className="flex gap-[3px]">
            {[0, 0.2, 0.4, 0.6, 0.8, 1].map((t) => (
              <span
                key={t}
                className="w-6 h-3 rounded-[2px]"
                style={{ backgroundColor: cellColor(t * data.maxOrders, data.maxOrders) }}
              />
            ))}
          </div>
          <span className="text-xs text-soft">Busy</span>

          {data.quietest && (
            <span className="text-xs text-soft ml-auto hidden sm:inline">
              Slowest trading hour: {DAYS[data.quietest.day]}{" "}
              {hourLabel(data.quietest.hour)}
            </span>
          )}
        </div>
      </div>
    </DashCard>
  )
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="contents">{children}</div>
}

/**
 * Orange at an intensity-driven alpha. The exponent lifts mid-range cells:
 * a linear ramp leaves everything but the peak looking empty, because most
 * hours sit well below the busiest one.
 */
function cellColor(orders: number, max: number) {
  if (orders <= 0) return "#f4f5f7"
  const intensity = max > 0 ? Math.min(1, orders / max) : 0
  const alpha = 0.14 + 0.86 * Math.pow(intensity, 0.65)
  return `rgba(249, 115, 22, ${alpha.toFixed(3)})`
}

function hourLabel(hour: number) {
  const suffix = hour < 12 ? "AM" : "PM"
  const h = hour % 12 === 0 ? 12 : hour % 12
  return `${h} ${suffix}`
}

function shortHour(hour: number) {
  const suffix = hour < 12 ? "a" : "p"
  const h = hour % 12 === 0 ? 12 : hour % 12
  return `${h}${suffix}`
}
