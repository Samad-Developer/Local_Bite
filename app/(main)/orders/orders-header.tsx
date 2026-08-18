"use client"

import { useSyncExternalStore } from "react"
import { ACTIVE_STATUSES, type Order } from "./config"

export default function OrdersHeader({ orders }: { orders: Order[] }) {
  const total = orders.length
  const active = orders.filter((o) => ACTIVE_STATUSES.includes(o.status)).length

  const hydrated = useSyncExternalStore(subscribe, () => true, () => false)

  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)
  const today = orders.filter(
    (o) => new Date(o.createdAt) >= startOfToday,
  ).length

  return (
    <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight text-title leading-none">
          Orders
        </h1>

        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#bbf7d0] bg-[#f0fdf4] px-2 py-0.5 text-[11px] font-medium text-[#16a34a]">
          <span className="relative flex w-1.5 h-1.5">
            <span className="absolute inline-flex w-full h-full rounded-full bg-[#16a34a] opacity-60 animate-ping" />
            <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-[#16a34a]" />
          </span>
          Live
        </span>
      </div>

      <div className="flex items-center gap-x-2 text-xs text-soft">
        <Stat value={total} label={total === 1 ? "order" : "orders"} />
        <Dot />
        <Stat value={active} label="in progress" />
        {hydrated && (
          <>
            <Dot />
            <Stat value={today} label="today" />
          </>
        )}
      </div>
    </header>
  )
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <span className="whitespace-nowrap">
      <span className="text-label font-semibold tabular-nums">{value}</span>{" "}
      {label}
    </span>
  )
}

function subscribe() {
  return () => {}
}

function Dot() {
  return <span className="text-[#9ca3af]">·</span>
}
