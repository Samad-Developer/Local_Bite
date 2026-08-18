export const CURRENCY = "Rs."

const LOCALE = "en-US"

export function formatCurrency(value: number) {
  const n = Number.isFinite(value) ? value : 0
  return `${CURRENCY} ${Math.round(n).toLocaleString(LOCALE)}`
}

export function formatCompactCurrency(value: number) {
  const n = Number.isFinite(value) ? value : 0
  const abs = Math.abs(n)

  if (abs >= 1_000_000) return `${CURRENCY} ${trim(n / 1_000_000)}M`
  if (abs >= 1_000) return `${CURRENCY} ${trim(n / 1_000)}K`
  return `${CURRENCY} ${Math.round(n)}`
}

export function formatNumber(value: number) {
  const n = Number.isFinite(value) ? value : 0
  return n.toLocaleString(LOCALE)
}

export function formatPercent(value: number, digits = 1) {
  const n = Number.isFinite(value) ? value : 0
  return `${n.toFixed(digits)}%`
}

export function formatDelta(value: number | null) {
  if (value === null || !Number.isFinite(value)) return "—"
  const sign = value > 0 ? "+" : ""
  return `${sign}${value.toFixed(1)}%`
}

export function percentChange(current: number, previous: number): number | null {
  if (!previous) return current > 0 ? null : 0
  return ((current - previous) / previous) * 100
}

export function formatDuration(minutes: number) {
  if (!Number.isFinite(minutes) || minutes < 0) return "—"
  if (minutes < 1) return `${Math.round(minutes * 60)}s`
  if (minutes < 60) return `${Math.round(minutes)}m`

  if (minutes < 1440) {
    const h = Math.floor(minutes / 60)
    const m = Math.round(minutes % 60)
    return m === 60 ? `${h + 1}h` : m ? `${h}h ${m}m` : `${h}h`
  }

  const d = Math.floor(minutes / 1440)
  const h = Math.round((minutes % 1440) / 60)
  return h === 24 ? `${d + 1}d` : h ? `${d}d ${h}h` : `${d}d`
}

export function formatElapsed(from: string | Date, now: number = Date.now()) {
  const seconds = Math.max(0, Math.floor((now - new Date(from).getTime()) / 1000))
  if (seconds < 60) return `${seconds}s ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

export function minutesSince(from: string | Date, now: number = Date.now()) {
  return Math.max(0, Math.floor((now - new Date(from).getTime()) / 60000))
}

function trim(n: number) {
  return Number(n.toFixed(1)).toString()
}
