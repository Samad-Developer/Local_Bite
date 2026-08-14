"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { RANGE_OPTIONS, type RangeKey } from "@/types/dashboard.types"

export default function RangeTabs({ value }: { value: RangeKey }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  function select(next: RangeKey) {
    if (next === value) return
    startTransition(() => {
      router.push(`/dashboard?range=${next}`)
    })
  }

  return (
    <div className="flex items-center gap-2">
      {pending && <Loader2 className="w-3.5 h-3.5 text-soft animate-spin" />}

      <div className="inline-flex items-center bg-elevated border border-border rounded-lg p-0.5">
        {RANGE_OPTIONS.map((option) => {
          const active = option.value === value
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => select(option.value)}
              aria-pressed={active}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-colors duration-150 cursor-pointer",
                active
                  ? "bg-surface text-title border border-border"
                  : "text-label hover:text-title border border-transparent",
              )}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
