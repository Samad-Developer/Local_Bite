import Link from "next/link"
import type { Route } from "next"
import { ArrowDownRight, ArrowRight, ArrowUpRight, Minus } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDelta } from "@/lib/utils/format"

export function Section({
  title,
  action,
  className,
  children,
}: {
  title: string
  action?: React.ReactNode
  className?: string
  children: React.ReactNode
}) {
  return (
    <section className={cn("space-y-4", className)}>
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-label">
          {title}
        </h2>
        {action}
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  )
}

export function DashCard({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "bg-surface border border-border rounded-xl",
        "shadow-[0_1px_2px_rgba(17,17,17,0.04),0_8px_24px_-12px_rgba(17,17,17,0.10)]",
        "transition-shadow duration-300",
        "hover:shadow-[0_1px_2px_rgba(17,17,17,0.05),0_12px_32px_-12px_rgba(17,17,17,0.14)]",
        className,
      )}
    >
      {children}
    </div>
  )
}

export function CardHeading({
  icon: Icon,
  title,
  subtitle,
  action,
  className,
}: {
  icon?: React.ElementType
  title: string
  subtitle?: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-3 px-5 py-4 border-b border-border",
        className,
      )}
    >
      <div className="flex items-start gap-2.5 min-w-0">
        {Icon && <Icon className="w-4 h-4 text-label shrink-0 mt-0.5" />}
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-title leading-tight truncate">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-label mt-1 truncate">{subtitle}</p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

export function CardLink({
  href,
  children,
  prefetch = false,
}: {
  href: Route
  children: React.ReactNode
  prefetch?: boolean
}) {
  return (
    <Link
      href={href}
      prefetch={prefetch}
      className="inline-flex items-center gap-1 text-xs font-medium text-label hover:text-brand transition-colors duration-150"
    >
      {children}
      <ArrowRight className="w-3.5 h-3.5" />
    </Link>
  )
}

export function MicroLabel({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <p
      className={cn(
        "text-[11px] font-semibold uppercase tracking-widest text-label",
        className,
      )}
    >
      {children}
    </p>
  )
}

export function DeltaPill({
  change,
  invert = false,
  suffix,
}: {
  change: number | null
  invert?: boolean
  suffix?: string
}) {
  if (change === null || change === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-soft">
        <Minus className="w-3 h-3" />
        {change === 0 ? "No change" : "No baseline"}
        {suffix && <span>· {suffix}</span>}
      </span>
    )
  }

  const good = invert ? change < 0 : change > 0
  const Icon = change > 0 ? ArrowUpRight : ArrowDownRight

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-xs font-medium tabular-nums",
        good ? "text-[#16a34a]" : "text-[#dc2626]",
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      {formatDelta(change)}
      {suffix && <span className="text-soft font-normal ml-1">{suffix}</span>}
    </span>
  )
}

export function Sparkline({
  data,
  tone = "brand",
  className,
}: {
  data: number[]
  tone?: "brand" | "neutral"
  className?: string
}) {
  if (data.length < 2) return null

  const max = Math.max(...data)
  const min = Math.min(...data)
  const span = max - min || 1

  const stroke = tone === "neutral" ? "#6b7280" : SERIES

  const xy = data.map((v, i) => ({
    x: (i / (data.length - 1)) * 100,
    y: 26 - ((v - min) / span) * 22,
  }))

  const line = xy.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ")
  const area = `${line} L100,28 L0,28 Z`
  const last = xy[xy.length - 1]

  return (
    <div className={cn("relative w-full h-6", className)}>
      <svg
        viewBox="0 0 100 28"
        preserveAspectRatio="none"
        className="w-full h-full overflow-visible"
        aria-hidden="true"
      >
        <path d={area} fill={stroke} fillOpacity={0.12} />

        <path
          d={line}
          fill="none"
          stroke={stroke}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          pathLength={1}
          strokeDasharray={1}
          className="animate-draw-line"
          style={{ ["--draw-length" as string]: 1 }}
        />
      </svg>

      <span
        className="absolute w-[7px] h-[7px] rounded-full ring-2 ring-surface -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{
          left: `${last.x}%`,
          top: `${(last.y / 28) * 100}%`,
          backgroundColor: stroke,
        }}
      />
    </div>
  )
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  className,
}: {
  icon: React.ElementType
  title: string
  description?: string
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-12 px-6",
        className,
      )}
    >
      <Icon className="w-5 h-5 text-[#9ca3af] mb-3" strokeWidth={1.5} />
      <p className="text-sm font-medium text-title">{title}</p>
      {description && (
        <p className="text-xs text-soft mt-1 max-w-[26ch] leading-relaxed">
          {description}
        </p>
      )}
    </div>
  )
}

export function ShareBar({
  value,
  color = SERIES,
  className,
}: {
  value: number
  color?: string
  className?: string
}) {
  return (
    <div className={cn("h-1.5 rounded-full bg-[#f1f2f4] overflow-hidden", className)}>
      <div
        className="h-full rounded-full origin-left animate-grow-bar transition-[width] duration-700 ease-out"
        style={{
          width: `${Math.max(2, Math.min(100, value))}%`,
          backgroundColor: color,
        }}
      />
    </div>
  )
}

export const CATEGORICAL = [
  "#f97316",
  "#2563eb",
  "#0d9488",
  "#8b5cf6",
  "#db2777",
  "#65a30d",
]

export const STATUS = {
  good: "#16a34a",
  warn: "#ca8a04",
  bad: "#dc2626",
}

export const TYPE_LABELS: Record<string, string> = {
  DINE_IN: "Dine In",
  TAKEAWAY: "Takeaway",
  DELIVERY: "Delivery",
}

export const TYPE_COLORS: Record<string, string> = {
  DINE_IN: CATEGORICAL[0],
  TAKEAWAY: CATEGORICAL[1],
  DELIVERY: CATEGORICAL[2],
}

export const PAYMENT_COLORS: Record<string, string> = {
  CASH: CATEGORICAL[3],
  CARD: CATEGORICAL[4],
  ONLINE: CATEGORICAL[5],
}

export const SERIES = CATEGORICAL[0]

export function slotColor(index: number) {
  return CATEGORICAL[index] ?? "#94a3b8"
}
