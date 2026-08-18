"use client"

import { useMemo, useState } from "react"
import { Layers } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  CardHeading,
  DashCard,
  EmptyState,
  TYPE_COLORS,
  TYPE_LABELS,
  slotColor,
} from "./ui"
import {
  formatCompactCurrency,
  formatCurrency,
  formatPercent,
} from "@/lib/utils/format"
import type { ChannelTrendPoint } from "@/types/dashboard.types"

const CHART_HEIGHT = 220

type Mode = "value" | "share"

export default function ChannelTrend({
  points,
  keys,
  subtitle,
}: {
  points: ChannelTrendPoint[]
  keys: string[]
  subtitle: string
}) {
  const [mode, setMode] = useState<Mode>("value")
  const [hover, setHover] = useState<number | null>(null)

  const grandTotal = points.reduce((acc, p) => acc + p.total, 0)

  const totals = useMemo(() => {
    const map = new Map<string, number>()
    for (const key of keys) {
      map.set(
        key,
        points.reduce((acc, p) => acc + (p.values[key] ?? 0), 0),
      )
    }
    return map
  }, [points, keys])

  const ordered = useMemo(
    () => [...keys].sort((a, b) => (totals.get(b) ?? 0) - (totals.get(a) ?? 0)),
    [keys, totals],
  )

  const ceiling =
    mode === "share" ? 100 : niceCeiling(Math.max(...points.map((p) => p.total), 0))

  const toX = (i: number) => (points.length > 1 ? (i / (points.length - 1)) * 100 : 50)
  const toY = (v: number) => 100 - (ceiling ? (v / ceiling) * 94 : 0)

  const valueAt = (key: string, i: number) => {
    const raw = points[i].values[key] ?? 0
    if (mode === "value") return raw
    return points[i].total > 0 ? (raw / points[i].total) * 100 : 0
  }

  const bands = useMemo(() => {
    const below = new Array(points.length).fill(0)

    return ordered.map((key) => {
      const lower = [...below]
      const upper = points.map((_, i) => {
        below[i] += valueAt(key, i)
        return below[i]
      })
      return { key, lower, upper }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ordered, points, mode])

  const active = hover !== null ? points[hover] : null

  if (grandTotal === 0) {
    return (
      <DashCard className="flex flex-col">
        <CardHeading icon={Layers} title="Channel mix over time" subtitle={subtitle} />
        <EmptyState
          icon={Layers}
          title="No channel history"
          description="Once orders arrive you'll see how dine-in, takeaway and delivery move against each other."
          className="flex-1"
        />
      </DashCard>
    )
  }

  return (
    <DashCard className="flex flex-col">
      <CardHeading
        icon={Layers}
        title="Channel mix over time"
        subtitle={subtitle}
        action={
          <div className="flex items-center bg-elevated border border-border rounded-lg p-0.5">
            {(
              [
                ["value", "Value"],
                ["share", "Share"],
              ] as [Mode, string][]
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setMode(value)}
                aria-pressed={mode === value}
                className={cn(
                  "px-2.5 py-1 text-xs rounded-md transition-colors duration-150 cursor-pointer border",
                  mode === value
                    ? "bg-surface text-title font-medium border-border"
                    : "text-label hover:text-title border-transparent",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        }
      />

      <div className="p-5">
        <div className="flex items-baseline gap-2.5 mb-4 h-5">
          {active ? (
            <>
              <span className="text-sm font-medium text-title">{active.label}</span>
              <span className="text-xs text-soft tabular-nums">
                {formatCurrency(active.total)}
              </span>
            </>
          ) : (
            <span className="text-xs text-soft">
              {mode === "share"
                ? "Each band is that channel's share of the day"
                : "Hover to break a day down by channel"}
            </span>
          )}
        </div>

        <div className="relative" style={{ height: CHART_HEIGHT }}>
          {[0, 0.5, 1].map((t) => (
            <div
              key={t}
              className="absolute left-0 right-0 flex items-center -translate-y-1/2"
              style={{ top: `${100 - t * 94}%` }}
            >
              <span className="w-14 pr-3 text-right text-[10px] text-soft tabular-nums shrink-0">
                {mode === "share"
                  ? `${Math.round(ceiling * t)}%`
                  : formatCompactCurrency(ceiling * t)}
              </span>
              <div className="flex-1 border-t border-[#f1f2f4]" />
            </div>
          ))}

          <div
            className="absolute inset-y-0 left-14 right-0"
            onMouseMove={(e) => {
              const box = e.currentTarget.getBoundingClientRect()
              const ratio = (e.clientX - box.left) / box.width
              const index = Math.round(ratio * (points.length - 1))
              setHover(Math.min(points.length - 1, Math.max(0, index)))
            }}
            onMouseLeave={() => setHover(null)}
          >
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="absolute inset-0 w-full h-full"
              aria-hidden="true"
            >
              {bands.map(({ key, lower, upper }, i) => (
                <path
                  key={key}
                  d={bandPath(lower, upper, toX, toY)}
                  fill={TYPE_COLORS[key] ?? slotColor(i)}
                  fillOpacity={0.9}
                  stroke="#ffffff"
                  strokeWidth={2}
                  vectorEffect="non-scaling-stroke"
                  className="animate-fade-rise"
                  style={{ animationDelay: `${i * 90}ms` }}
                />
              ))}
            </svg>

            {hover !== null && (
              <div
                className="absolute top-0 bottom-0 w-px bg-title/25 pointer-events-none"
                style={{ left: `${toX(hover)}%` }}
              />
            )}

            {active && (
              <div
                className={cn(
                  "absolute top-2 z-10 pointer-events-none px-2",
                  toX(hover!) > 55 ? "-translate-x-full" : "",
                )}
                style={{ left: `${toX(hover!)}%` }}
              >
                <div className="bg-surface border border-border rounded-lg shadow-md px-3 py-2 min-w-[180px]">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-label mb-2">
                    {active.label}
                  </p>

                  {ordered.map((key) => {
                    const raw = active.values[key] ?? 0
                    const pct = active.total > 0 ? (raw / active.total) * 100 : 0
                    return (
                      <p
                        key={key}
                        className="text-xs flex items-center justify-between gap-4 mt-1"
                      >
                        <span className="inline-flex items-center gap-1.5 text-label">
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: TYPE_COLORS[key] }}
                          />
                          {TYPE_LABELS[key] ?? key}
                        </span>
                        <span className="font-medium text-title tabular-nums">
                          {mode === "share"
                            ? formatPercent(pct, 0)
                            : formatCurrency(raw)}
                        </span>
                      </p>
                    )
                  })}

                  <p className="text-xs flex items-center justify-between gap-4 mt-1.5 pt-1.5 border-t border-border">
                    <span className="text-label">Total</span>
                    <span className="font-medium text-title tabular-nums">
                      {formatCurrency(active.total)}
                    </span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="relative h-4 ml-14 mt-3">
          {points.map((point, i) => {
            if (!labelVisible(i, points.length)) return null
            const isFirst = i === 0
            const isLast = i === points.length - 1
            return (
              <span
                key={point.key}
                className={cn(
                  "absolute top-0 text-[10px] whitespace-nowrap",
                  isFirst ? "" : isLast ? "-translate-x-full" : "-translate-x-1/2",
                  hover === i ? "text-title font-medium" : "text-soft",
                )}
                style={{ left: `${toX(i)}%` }}
              >
                {point.label}
              </span>
            )
          })}
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-2 mt-5 pt-4 border-t border-border">
          {ordered.map((key) => {
            const value = totals.get(key) ?? 0
            return (
              <div key={key} className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: TYPE_COLORS[key] }}
                />
                <span className="text-xs text-label">
                  {TYPE_LABELS[key] ?? key}
                </span>
                <span className="text-xs font-medium text-title tabular-nums">
                  {formatCurrency(value)}
                </span>
                <span className="text-xs text-soft tabular-nums">
                  {formatPercent((value / grandTotal) * 100, 0)}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </DashCard>
  )
}

function bandPath(
  lower: number[],
  upper: number[],
  toX: (i: number) => number,
  toY: (v: number) => number,
) {
  const top = upper
    .map((v, i) => `${i === 0 ? "M" : "L"}${toX(i).toFixed(3)},${toY(v).toFixed(3)}`)
    .join(" ")

  const bottom = lower
    .map((v, i) => `L${toX(i).toFixed(3)},${toY(v).toFixed(3)}`)
    .reverse()
    .join(" ")

  return `${top} ${bottom} Z`
}

function labelVisible(index: number, total: number) {
  const step = Math.max(1, Math.ceil(total / 8))
  return index % step === 0 || index === total - 1
}

function niceCeiling(max: number) {
  if (max <= 0) return 0
  const magnitude = 10 ** Math.floor(Math.log10(max))
  return Math.ceil(max / magnitude) * magnitude
}
