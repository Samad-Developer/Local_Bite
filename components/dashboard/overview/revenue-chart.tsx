"use client"

import { useId, useMemo, useState } from "react"
import { LineChart } from "lucide-react"
import { cn } from "@/lib/utils"
import { CardHeading, DashCard, EmptyState, SERIES, STATUS } from "./ui"
import {
  formatCompactCurrency,
  formatCurrency,
  formatDelta,
  formatNumber,
  percentChange,
} from "@/lib/utils/format"
import type { ComparisonPoint, TrendPoint } from "@/types/dashboard.types"

type Metric = "revenue" | "orders"

const CHART_HEIGHT = 260

export default function RevenueChart({
  data,
  previous,
  subtitle,
  comparisonLabel,
}: {
  data: TrendPoint[]
  previous: ComparisonPoint[]
  subtitle: string
  comparisonLabel: string
}) {
  const gradientId = useId().replace(/:/g, "")
  const [metric, setMetric] = useState<Metric>("revenue")
  const [compare, setCompare] = useState(true)
  const [hover, setHover] = useState<number | null>(null)

  const values = useMemo(
    () => data.map((d) => (metric === "revenue" ? d.revenue : d.orders)),
    [data, metric],
  )

  const prevValues = useMemo(
    () => previous.map((d) => (metric === "revenue" ? d.revenue : d.orders)),
    [previous, metric],
  )

  const total = values.reduce((acc, v) => acc + v, 0)
  const prevTotal = prevValues.reduce((acc, v) => acc + v, 0)
  const hasData = total > 0
  const hasComparison = prevTotal > 0
  const showPrev = compare && hasComparison

  const max = Math.max(...values, 0)

  // The axis has to clear both series, or the comparison line gets clipped.
  const ceiling = niceCeiling(showPrev ? Math.max(max, ...prevValues) : max)

  const toY = (value: number) => 100 - (ceiling ? (value / ceiling) * 92 : 0)
  const toX = (index: number) =>
    data.length > 1 ? (index / (data.length - 1)) * 100 : 50

  const linePath = pathFor(values, toX, toY)
  const prevPath = pathFor(prevValues, toX, toY)
  const areaPath = `${linePath} L100,100 L0,100 Z`

  const ticks = [0, 0.25, 0.5, 0.75, 1]
  const activePoint = hover !== null ? data[hover] : null
  const activePrev = hover !== null ? prevValues[hover] : null
  const totalDelta = percentChange(total, prevTotal)

  return (
    <DashCard className="flex flex-col">
      <CardHeading
        icon={LineChart}
        title="Revenue trend"
        subtitle={subtitle}
        action={
          <div className="flex items-center bg-elevated border border-border rounded-lg p-0.5">
            {(["revenue", "orders"] as Metric[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMetric(m)}
                aria-pressed={metric === m}
                className={cn(
                  "px-2.5 py-1 text-xs rounded-md capitalize transition-colors duration-150 cursor-pointer border",
                  metric === m
                    ? "bg-surface text-title font-medium border-border"
                    : "text-label hover:text-title border-transparent",
                )}
              >
                {m}
              </button>
            ))}
          </div>
        }
      />

      {!hasData ? (
        <EmptyState
          icon={LineChart}
          title="No sales in this period"
          description="Once orders start coming in, the trend will be plotted here."
          className="flex-1"
        />
      ) : (
        <div className="p-5">
          {/* ── Summary row ── */}
          <div className="flex items-end justify-between gap-4 mb-5">
            <div>
              {/* Proportional figures — tabular-nums makes a display-size
                  number look loose. */}
              <p className="text-[30px] font-semibold text-title tracking-tight leading-none">
                {metric === "revenue" ? formatCurrency(total) : formatNumber(total)}
              </p>
              <p className="text-xs text-soft mt-2">
                peak{" "}
                {metric === "revenue"
                  ? formatCompactCurrency(max)
                  : formatNumber(max)}
                {hasComparison && (
                  <>
                    {" · "}
                    <span
                      className="font-medium"
                      style={{
                        color:
                          totalDelta === null
                            ? undefined
                            : totalDelta >= 0
                              ? STATUS.good
                              : STATUS.bad,
                      }}
                    >
                      {formatDelta(totalDelta)}
                    </span>{" "}
                    {comparisonLabel}
                  </>
                )}
              </p>
            </div>

            {hasComparison && (
              <button
                type="button"
                onClick={() => setCompare((v) => !v)}
                aria-pressed={compare}
                className={cn(
                  "inline-flex items-center gap-2 text-xs rounded-lg border px-2.5 py-1.5 cursor-pointer transition-colors duration-150 shrink-0",
                  compare
                    ? "border-border bg-elevated text-title"
                    : "border-border text-label hover:text-title",
                )}
              >
                <svg width="16" height="8" aria-hidden="true" className="shrink-0">
                  <line
                    x1="0"
                    y1="4"
                    x2="16"
                    y2="4"
                    stroke={compare ? "#64748b" : "#cbd5e1"}
                    strokeWidth="1.75"
                    strokeDasharray="3 2.5"
                  />
                </svg>
                Compare
              </button>
            )}
          </div>

          {/* ── Plot area ── */}
          <div className="relative" style={{ height: CHART_HEIGHT }}>
            {ticks.map((t) => (
              <div
                key={t}
                className="absolute left-0 right-0 flex items-center -translate-y-1/2"
                // Matches toY() so the grid line sits exactly on its value.
                style={{ top: `${100 - t * 92}%` }}
              >
                <span className="w-14 pr-3 text-right text-[10px] text-soft tabular-nums shrink-0">
                  {metric === "revenue"
                    ? formatCompactCurrency(ceiling * t)
                    : formatNumber(Math.round(ceiling * t))}
                </span>
                <div className="flex-1 border-t border-[#f1f2f4]" />
              </div>
            ))}

            <div
              className="absolute inset-y-0 left-14 right-0"
              onMouseMove={(e) => {
                const box = e.currentTarget.getBoundingClientRect()
                const ratio = (e.clientX - box.left) / box.width
                const index = Math.round(ratio * (data.length - 1))
                setHover(Math.min(data.length - 1, Math.max(0, index)))
              }}
              onMouseLeave={() => setHover(null)}
            >
              <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="absolute inset-0 w-full h-full"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={SERIES} stopOpacity="0.28" />
                    <stop offset="55%" stopColor={SERIES} stopOpacity="0.09" />
                    <stop offset="100%" stopColor={SERIES} stopOpacity="0" />
                  </linearGradient>
                </defs>

                <path
                  d={areaPath}
                  fill={`url(#${gradientId})`}
                  className="animate-fade-rise"
                  style={{ animationDelay: "260ms" }}
                />

                {/* Previous period sits behind, dashed and neutral, so it
                    reads as a reference rather than a second headline. */}
                {showPrev && (
                  <path
                    d={prevPath}
                    fill="none"
                    stroke="#64748b"
                    strokeWidth={1.5}
                    strokeDasharray="4 3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                    opacity={0.75}
                  />
                )}

                {/* pathLength normalises the dash maths to 0–1, so the
                    draw-in works despite the non-uniform viewBox scaling. */}
                <path
                  key={`${metric}-${data.length}`}
                  d={linePath}
                  fill="none"
                  stroke={SERIES}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                  pathLength={1}
                  strokeDasharray={1}
                  className="animate-draw-line"
                  style={{ ["--draw-length" as string]: 1 }}
                />
              </svg>

              {hover !== null && (
                <>
                  <div
                    className="absolute top-0 bottom-0 w-px bg-[#e5e7eb] pointer-events-none"
                    style={{ left: `${toX(hover)}%` }}
                  />
                  {showPrev && (
                    <div
                      className="absolute w-2 h-2 rounded-full bg-surface border-[1.5px] border-[#64748b] pointer-events-none -translate-x-1/2 -translate-y-1/2"
                      style={{
                        left: `${toX(hover)}%`,
                        top: `${toY(prevValues[hover] ?? 0)}%`,
                      }}
                    />
                  )}
                  <div
                    className="absolute w-2.5 h-2.5 rounded-full bg-surface border-2 border-brand pointer-events-none -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${toX(hover)}%`, top: `${toY(values[hover])}%` }}
                  />
                </>
              )}

              {activePoint && (
                <div
                  className={cn(
                    "absolute top-2 z-10 pointer-events-none px-2",
                    toX(hover!) > 60 ? "-translate-x-full" : "",
                  )}
                  style={{ left: `${toX(hover!)}%` }}
                >
                  <div className="bg-surface border border-border rounded-lg shadow-md px-3 py-2 min-w-[170px]">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-label mb-2">
                      {activePoint.label}
                    </p>

                    <TooltipRow
                      swatch="bg-brand"
                      label="This period"
                      value={
                        metric === "revenue"
                          ? formatCurrency(values[hover!])
                          : formatNumber(values[hover!])
                      }
                    />

                    {showPrev && (
                      <>
                        <TooltipRow
                          swatch="bg-[#64748b]"
                          label="Previous"
                          value={
                            metric === "revenue"
                              ? formatCurrency(activePrev ?? 0)
                              : formatNumber(activePrev ?? 0)
                          }
                        />
                        <p className="text-xs flex items-center justify-between gap-4 mt-1.5 pt-1.5 border-t border-border">
                          <span className="text-label">Change</span>
                          <Delta
                            change={percentChange(values[hover!], activePrev ?? 0)}
                          />
                        </p>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── X axis ── */}
          <div className="relative h-4 ml-14 mt-3">
            {data.map((point, i) => {
              if (!labelVisible(i, data.length)) return null
              const isFirst = i === 0
              const isLast = i === data.length - 1
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
        </div>
      )}
    </DashCard>
  )
}

function TooltipRow({
  swatch,
  label,
  value,
}: {
  swatch: string
  label: string
  value: string
}) {
  return (
    <p className="text-xs flex items-center justify-between gap-4 mt-1">
      <span className="inline-flex items-center gap-1.5 text-label">
        <span className={cn("w-1.5 h-1.5 rounded-full", swatch)} />
        {label}
      </span>
      <span className="font-medium text-title tabular-nums">{value}</span>
    </p>
  )
}

function Delta({ change }: { change: number | null }) {
  return (
    <span
      className={cn("font-medium tabular-nums", change === null && "text-soft")}
      style={{
        color:
          change === null ? undefined : change >= 0 ? STATUS.good : STATUS.bad,
      }}
    >
      {formatDelta(change)}
    </span>
  )
}

function pathFor(
  values: number[],
  toX: (i: number) => number,
  toY: (v: number) => number,
) {
  return values
    .map((v, i) => `${i === 0 ? "M" : "L"}${toX(i).toFixed(3)},${toY(v).toFixed(3)}`)
    .join(" ")
}

/** Keep roughly 8 x-axis labels regardless of bucket count. */
function labelVisible(index: number, total: number) {
  const step = Math.max(1, Math.ceil(total / 8))
  return index % step === 0 || index === total - 1
}

function niceCeiling(max: number) {
  if (max <= 0) return 0
  const magnitude = 10 ** Math.floor(Math.log10(max))
  return Math.ceil(max / magnitude) * magnitude
}
