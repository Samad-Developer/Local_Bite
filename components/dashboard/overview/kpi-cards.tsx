import { cn } from "@/lib/utils"
import { DeltaPill, Sparkline } from "./ui"
import {
  formatCurrency,
  formatDuration,
  formatNumber,
  formatPercent,
} from "@/lib/utils/format"
import type { OverviewData } from "@/types/dashboard.types"

export default function KpiCards({ data }: { data: OverviewData }) {
  const cards = [
    {
      label: "Revenue",
      value: formatCurrency(data.revenue.current),
      change: data.revenue.change,
      invert: false,
      spark: data.revenueSparkline,
      footnote: `${formatCurrency(data.collected)} collected`,
    },
    {
      label: "Orders",
      value: formatNumber(data.orders.current),
      change: data.orders.change,
      invert: false,
      spark: data.ordersSparkline,
      footnote: `${formatNumber(data.itemsSold)} items sold`,
    },
    {
      label: "Avg order value",
      value: formatCurrency(data.avgOrderValue.current),
      change: data.avgOrderValue.change,
      invert: false,
      spark: null,
      footnote: `Was ${formatCurrency(data.avgOrderValue.previous)}`,
    },
    {
      label: "Cancellation rate",
      value: formatPercent(data.cancelRate.current),
      change: data.cancelRate.change,
      invert: true,
      spark: null,
      footnote: `${formatCurrency(data.cancelledValue)} lost`,
    },
  ]

  return (
    <div className="border-y border-border">
      {/* ── Headline metrics ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 divide-y sm:divide-y-0 divide-border xl:divide-x">
        {cards.map((card, i) => (
          <div
            key={card.label}
            className={cn(
              "px-5 py-5",
              i === 0 && "xl:pl-0",
              i === cards.length - 1 && "xl:pr-0",
            )}
          >
            <p className="text-[11px] font-semibold uppercase tracking-widest text-soft">
              {card.label}
            </p>

            <p className="text-[28px] font-semibold text-title tracking-tight tabular-nums leading-none mt-2.5">
              {card.value}
            </p>

            <div className="mt-3">
              <DeltaPill change={card.change} invert={card.invert} />
            </div>

            <p className="text-xs text-soft mt-1.5 truncate">{card.footnote}</p>

            {/* Fixed slot keeps all four columns the same height. */}
            <div className="h-6 mt-3">
              {card.spark && card.spark.some((v) => v > 0) && (
                <Sparkline data={card.spark} />
              )}
            </div>
          </div>
        ))}
      </div>

      <MiniStats data={data} />
    </div>
  )
}

// ─── Secondary metric row ─────────────────────────────
// Was eight boxed cells; now a plain definition list that recedes
// behind the headline numbers.

function MiniStats({ data }: { data: OverviewData }) {
  const stats = [
    {
      label: "Outstanding",
      value: formatCurrency(data.outstanding),
      tone: data.outstanding > 0 ? "warn" : "plain",
    },
    {
      label: "Avg fulfillment",
      value:
        data.avgFulfillmentMinutes === null
          ? "—"
          : formatDuration(data.avgFulfillmentMinutes),
      tone: "plain",
    },
    {
      label: "Customers",
      value: formatNumber(data.uniqueCustomers),
      tone: "plain",
    },
    {
      label: "Repeat rate",
      value: formatPercent(data.repeatRate, 0),
      tone: data.repeatRate >= 30 ? "good" : "plain",
    },
    {
      label: "Discounts given",
      value: formatCurrency(data.discountGiven),
      tone: "plain",
    },
    {
      label: "Delivery fees",
      value: formatCurrency(data.deliveryFeeEarned),
      tone: "plain",
    },
    {
      label: "Items / order",
      value:
        data.orders.current > 0
          ? (data.itemsSold / data.orders.current).toFixed(1)
          : "—",
      tone: "plain",
    },
    {
      label: "Peak hour",
      value: data.busiestHour === null ? "—" : formatHour(data.busiestHour),
      tone: "plain",
    },
  ]

  const toneClass: Record<string, string> = {
    good: "text-[#16a34a]",
    warn: "text-[#ca8a04]",
    plain: "text-title",
  }

  return (
    <dl className="flex flex-wrap gap-x-10 gap-y-4 py-4 border-t border-border">
      {stats.map((stat) => (
        <div key={stat.label}>
          <dt className="text-xs text-soft">{stat.label}</dt>
          <dd
            className={`text-sm font-medium tabular-nums mt-1 ${toneClass[stat.tone]}`}
          >
            {stat.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}

function formatHour(hour: number) {
  const suffix = hour < 12 ? "AM" : "PM"
  const h = hour % 12 === 0 ? 12 : hour % 12
  return `${h} ${suffix}`
}
