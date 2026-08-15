import Link from "next/link"
import type { Route } from "next"
import { ArrowDownRight, ArrowRight, ArrowUpRight, Minus } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDelta } from "@/lib/utils/format"

// Design language: one hairline weight, a single soft elevation, neutral
// chrome. Colour lives in the data — the marks are the loudest thing on the
// page and everything around them stays quiet.
//
// Chart colour is not hand-picked; see the palette block at the bottom of
// this file for the rules and the validation the hues have to clear.
//
// Text colour ladder on the white surface (see globals.css):
//   text-title  #111111  headings and figures
//   text-label  #4b5563  subtitles, axis labels, legends
//   text-soft   #6b7280  meta lines and footnotes
// `text-muted` (#9ca3af) is 2.5:1 on white and must not be used for copy.
//
// Text never wears a series colour — a coloured swatch sits beside it and
// carries the identity instead. Light hues are illegible as type.

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
    <div
      className={cn(
        "bg-surface border border-border rounded-xl",
        // One soft elevation lifts the card off the grey page. Kept to a
        // wide, very low-alpha shadow so it reads as depth, not as chrome
        // competing with the marks inside.
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
        {/* Flat wash rather than a gradient: a gradient needs a unique <defs>
            id, and this renders from a Server Component where useId is not
            available — several sparklines on one page would collide. */}
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

      {/* End-dot marks "where we are now" — the one point worth labelling.
          Kept in HTML because the viewBox scales non-uniformly, which would
          squash an SVG <circle> into an ellipse. The 2px surface ring keeps
          it legible where it sits on the line. */}
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
  color = SERIES,
  className,
}: {
  value: number
  color?: string
  className?: string
}) {
  return (
    <div className={cn("h-1.5 rounded-full bg-[#f1f2f4] overflow-hidden", className)}>
      {/* `animate-grow-bar` sweeps the fill out from the baseline on first
          paint; the width itself still transitions when the range changes. */}
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

// ─── Chart palette ────────────────────────────────────
// Categorical slots encode *identity* (which channel, which method). The
// order is the colourblind-safety mechanism and must not be reordered or
// cycled past slot 6 — validated with the dataviz palette checker against
// the white card surface:
//
//   worst adjacent pair ΔE 11.3 (deuteranopia) · 22.6 (normal vision)
//
// Reordering silently breaks this: putting blue before orange collapses
// orange↔teal to ΔE 4.8 under protanopia.
//
// Slot 1 (#f97316) sits at 2.8:1 on white, under the 3:1 mark floor. That is
// permitted only because every chart using it also prints the value as text
// beside the swatch — keep those direct labels if you touch a legend.
//
// Deliberately NOT the status hexes (#16a34a / #ca8a04 / #dc2626): those are
// reserved for state, so a series can never impersonate "this went wrong".
export const CATEGORICAL = [
  "#f97316", // orange — brand
  "#2563eb", // blue
  "#0d9488", // teal
  "#8b5cf6", // violet
  "#db2777", // pink
  "#65a30d", // lime
]

/** State, never identity. Always shipped with a label, never colour alone. */
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

// Colour follows the entity, not its rank — filtering or re-sorting must
// never repaint a channel the reader has already learned.
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

/**
 * Ranked lists (top categories, busiest zones, best sellers) are one series
 * of *nominal* things — "Burgers" has no natural position relative to
 * "Drinks", it just happens to have sold more. So every bar wears slot 1.
 *
 * There is deliberately no rank ramp here. Fading a bar out as it gets
 * shorter re-encodes length as hue: it spends the identity channel on
 * information the bar already carries, and reads as though the lower rows
 * matter less rather than simply measuring less.
 */
export const SERIES = CATEGORICAL[0]

/** Resolve a categorical slot without ever generating a 7th hue. */
export function slotColor(index: number) {
  return CATEGORICAL[index] ?? "#94a3b8"
}
