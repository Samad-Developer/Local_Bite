import { Users } from "lucide-react"
import { CardHeading, DashCard, EmptyState, MicroLabel } from "./ui"
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils/format"
import type { OverviewData } from "@/types/dashboard.types"

export default function CustomerInsights({ data }: { data: OverviewData }) {
  const total = data.uniqueCustomers
  const repeatShare = total > 0 ? (data.repeatCustomers / total) * 100 : 0

  return (
    <DashCard className="flex flex-col">
      <CardHeading
        icon={Users}
        title="Customers"
        subtitle="Loyalty is cheaper than acquisition"
      />

      {total === 0 ? (
        <EmptyState
          icon={Users}
          title="No customers yet"
          description="Customer behaviour builds up as orders are placed."
          className="flex-1"
        />
      ) : (
        <div className="p-5 space-y-6">
          <div>
            <div className="flex items-baseline justify-between mb-3">
              <span className="text-2xl font-semibold text-title tracking-tight tabular-nums">
                {formatNumber(total)}
              </span>
              <span className="text-xs text-soft tabular-nums">
                {formatPercent(data.repeatRate, 0)} repeat
              </span>
            </div>

            <div className="h-1.5 rounded-full bg-[#f1f2f4] overflow-hidden flex">
              <div
                className="h-full bg-[#16a34a] transition-all duration-500"
                style={{ width: `${repeatShare}%` }}
              />
              <div
                className="h-full bg-brand transition-all duration-500"
                style={{ width: `${100 - repeatShare}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs mt-2.5">
              <span className="inline-flex items-center gap-1.5 text-label">
                <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a]" />
                {formatNumber(data.repeatCustomers)} returning
              </span>
              <span className="inline-flex items-center gap-1.5 text-label">
                <span className="w-1.5 h-1.5 rounded-full bg-brand" />
                {formatNumber(data.newCustomers)} new
              </span>
            </div>
          </div>

          <div className="pt-5 border-t border-border">
            <MicroLabel className="mb-4">Top spenders</MicroLabel>

            <ul className="space-y-3.5">
              {data.topCustomers.map((customer) => (
                <li key={customer.phone} className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-elevated border border-border flex items-center justify-center shrink-0">
                    <span className="text-[11px] font-medium text-label">
                      {customer.name?.charAt(0).toUpperCase() || "?"}
                    </span>
                  </span>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-title truncate">{customer.name}</p>
                    <p className="text-xs text-soft truncate mt-0.5">
                      {customer.phone} · {formatNumber(customer.orders)} order
                      {customer.orders === 1 ? "" : "s"}
                    </p>
                  </div>

                  <span className="text-sm font-medium text-title tabular-nums shrink-0">
                    {formatCurrency(customer.spent)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </DashCard>
  )
}
