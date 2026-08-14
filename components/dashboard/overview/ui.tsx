import Link from "next/link"
import type { Route } from "next"
import { ArrowDownRight, ArrowRight, ArrowUpRight, Minus } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDelta } from "@/lib/utils/format"

// Design language: one hairline weight, no shadows, neutral chrome.
// Orange is reserved for things that genuinely need attention —
// the active range, the revenue line, the peak hour, the top seller.
//
// Text colour ladder on the white surface (see globals.css):
//   text-title  #111111  headings and figures
//   text-label  #4b5563  subtitles, axis labels, legends
//   text-soft   #6b7280  meta lines and footnotes
// `text-muted` (#9ca3af) is 2.5:1 on white and must not be used for copy.

// ─── Section ──────────────────────────────────────────
// Groups related cards under a quiet typographic label so the page reads
// as a few short chapters instead of one long stack of identical boxes.

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

// ─── Card shell ───────────────────────────────────────

export function DashCard({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn("bg-surface border border-border rounded-xl", className)}>
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

/** The "→" affordance in card headers. Muted until hovered. */
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

/** Small caps label used inside cards to separate a sub-list. */
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

// ─── Delta ────────────────────────────────────────────
// `invert` flips the colour logic for metrics where lower is better
// (cancellation rate, refunds).

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

// ─── Sparkline ────────────────────────────────────────

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

  const stroke = tone === "neutral" ? "#6b7280" : "#f97316"

  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * 100
      const y = 26 - ((v - min) / span) * 24
      return `${x.toFixed(2)},${y.toFixed(2)}`
    })
    .join(" ")

  return (
    <svg
      viewBox="0 0 100 28"
      preserveAspectRatio="none"
      className={cn("w-full h-6 overflow-visible", className)}
      aria-hidden="true"
    >
      <polyline
        points={points}
        fill="none"
        stroke={stroke}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

// ─── Empty state ──────────────────────────────────────

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

// ─── Share bar ────────────────────────────────────────

export function ShareBar({
  value,
  color = "#f97316",
  className,
}: {
  value: number
  color?: string
  className?: string
}) {
  return (
    <div className={cn("h-1 rounded-full bg-[#f1f2f4] overflow-hidden", className)}>
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{
          width: `${Math.max(2, Math.min(100, value))}%`,
          backgroundColor: color,
        }}
      />
    </div>
  )
}

// ─── Channel tokens ───────────────────────────────────
// One colour per order type, shared by the donut and the stacked area so
// "delivery" means the same swatch wherever it appears. All three clear
// 3:1 against white, the floor for a chart mark you have to identify.

export const TYPE_LABELS: Record<string, string> = {
  DINE_IN: "Dine In",
  TAKEAWAY: "Takeaway",
  DELIVERY: "Delivery",
}

export const TYPE_COLORS: Record<string, string> = {
  DINE_IN: "#f97316",
  TAKEAWAY: "#1f2937",
  DELIVERY: "#6b7280",
}

/**
 * Descending-emphasis ramp for ranked lists (categories, zones): the
 * leader is loud, everything below it fades toward the page.
 */
export const RANK_RAMP = [
  "#f97316",
  "#fb923c",
  "#fdba74",
  "#cbd5e1",
  "#dde2e8",
  "#e8ecf0",
]
