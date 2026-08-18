"use client"

import { cn } from "@/lib/utils"
import { filterTabs, statusConfig } from "./config"

const activeTint: Record<string, string> = {
  "": "bg-[#111111] text-white border-[#111111]",
  NEW: "bg-[#eff6ff] text-[#2563eb] border-[#bfdbfe]",
  CONFIRMED: "bg-[#f5f3ff] text-[#7c3aed] border-[#ddd6fe]",
  PREPARING: "bg-[#fefce8] text-[#ca8a04] border-[#fde68a]",
  READY: "bg-[#fff7ed] text-[#f97316] border-[#fed7aa]",
  COMPLETED: "bg-[#f0fdf4] text-[#16a34a] border-[#bbf7d0]",
  CANCELLED: "bg-[#fef2f2] text-[#dc2626] border-[#fecaca]",
}

export default function OrderFilters({
  value,
  onChange,
  counts,
}: {
  value: string
  onChange: (next: string) => void
  counts: Record<string, number>
}) {
  return (
    <div
      role="tablist"
      aria-label="Filter orders by status"
      className="flex flex-wrap items-center gap-1.5"
    >
      {filterTabs.map((tab) => {
        const active = tab.value === value
        const count = counts[tab.value] ?? 0
        const dot = statusConfig[tab.value]?.dot

        return (
          <button
            key={tab.value || "all"}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.value)}
            className={cn(
              "group inline-flex items-center gap-2 rounded-full border pl-3 pr-2 py-1.5",
              "text-xs font-medium transition-colors duration-150 cursor-pointer",
              active
                ? activeTint[tab.value]
                : "bg-surface border-border text-label hover:border-border-hover hover:text-title",
            )}
          >
            {dot && (
              <span
                className={cn(
                  "w-1.5 h-1.5 rounded-full shrink-0 transition-opacity duration-150",
                  count === 0 && !active && "opacity-35",
                )}
                style={{ backgroundColor: dot }}
              />
            )}

            {tab.label}

            <span
              className={cn(
                "min-w-[1.25rem] rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-center",
                active
                  ? tab.value === ""
                    ? "bg-white/20 text-white"
                    : "bg-white/70"
                  : "bg-elevated text-soft group-hover:text-title",
              )}
            >
              {count}
            </span>
          </button>
        )
      })}
    </div>
  )
}
