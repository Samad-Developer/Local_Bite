import type { Route } from "next"
import { MapPin } from "lucide-react"
import { CardHeading, CardLink, DashCard, EmptyState, ShareBar } from "./ui"
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils/format"
import type { BreakdownSlice } from "@/types/dashboard.types"

export default function DeliveryAreas({ areas }: { areas: BreakdownSlice[] }) {
  const totalOrders = areas.reduce((acc, a) => acc + a.orders, 0)
  const totalRevenue = areas.reduce((acc, a) => acc + a.revenue, 0)

  return (
    <DashCard className="flex flex-col">
      <CardHeading
        icon={MapPin}
        title="Delivery zones"
        subtitle={
          totalOrders > 0
            ? `${formatNumber(totalOrders)} deliveries · ${formatCurrency(totalRevenue)}`
            : "Where your delivery orders come from"
        }
        action={
          <CardLink href={"/delivery-areas" as Route}>Manage zones</CardLink>
        }
      />

      {areas.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="No delivery orders"
          description="Zone performance shows up once delivery orders arrive."
          className="flex-1"
        />
      ) : (
        <div className="divide-y divide-border">
          {areas.slice(0, 6).map((area) => (
            <div key={area.key} className="px-5 py-3.5">
              <div className="flex items-center justify-between gap-3 mb-2">
                <span className="text-sm text-title truncate">{area.label}</span>
                <span className="text-sm font-medium text-title tabular-nums shrink-0">
                  {formatCurrency(area.revenue)}
                </span>
              </div>

              <ShareBar value={area.share} />

              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-soft">
                  {formatNumber(area.orders)} order
                  {area.orders === 1 ? "" : "s"} · avg{" "}
                  {formatCurrency(area.revenue / Math.max(1, area.orders))}
                </span>
                <span className="text-xs text-soft tabular-nums">
                  {formatPercent(area.share, 0)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashCard>
  )
}
