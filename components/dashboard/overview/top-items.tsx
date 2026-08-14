import Image from "next/image"
import { Trophy, UtensilsCrossed } from "lucide-react"
import { cn } from "@/lib/utils"
import { CardHeading, CardLink, DashCard, EmptyState, ShareBar } from "./ui"
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils/format"
import type { Route } from "next"
import type { TopItem } from "@/types/dashboard.types"

export default function TopItems({ items }: { items: TopItem[] }) {
  return (
    <DashCard className="flex flex-col">
      <CardHeading
        icon={Trophy}
        title="Top selling items"
        subtitle="Ranked by revenue in the selected period"
        action={
          <CardLink href={"/menu/items" as Route}>Manage menu</CardLink>
        }
      />

      {items.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="Nothing sold yet"
          description="Your best performers will be ranked here once orders come in."
          className="flex-1"
        />
      ) : (
        <div className="divide-y divide-border">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="flex items-center gap-3.5 px-5 py-3.5 hover:bg-elevated transition-colors duration-150"
            >
              {/* Only the leader gets the accent — the rest are plain numerals. */}
              <span
                className={cn(
                  "w-4 text-xs font-semibold tabular-nums shrink-0 text-right",
                  index === 0 ? "text-brand" : "text-soft",
                )}
              >
                {index + 1}
              </span>

              <div className="w-9 h-9 rounded-lg overflow-hidden border border-border bg-elevated shrink-0">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    width={36}
                    height={36}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <UtensilsCrossed
                      className="w-4 h-4 text-[#9ca3af]"
                      strokeWidth={1.5}
                    />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-title truncate">
                    {item.name}
                  </p>
                  {!item.isAvailable && (
                    <span className="text-[10px] font-medium text-[#dc2626] shrink-0">
                      Off menu
                    </span>
                  )}
                </div>
                <p className="text-xs text-soft truncate mt-0.5 mb-2">
                  {item.category} · {formatNumber(item.quantity)} sold
                </p>
                <ShareBar
                  value={item.share}
                  color={index === 0 ? "#f97316" : "#cbd5e1"}
                />
              </div>

              <div className="text-right shrink-0">
                <p className="text-sm font-medium text-title tabular-nums">
                  {formatCurrency(item.revenue)}
                </p>
                <p className="text-xs text-soft tabular-nums mt-0.5">
                  {formatPercent(item.share, 1)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashCard>
  )
}
