import { LayoutGrid } from "lucide-react"
import { CardHeading, DashCard, EmptyState, ShareBar } from "./ui"
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils/format"
import type { BreakdownSlice } from "@/types/dashboard.types"

export default function CategoryPerformance({
  categories,
}: {
  categories: BreakdownSlice[]
}) {
  const visible = categories.slice(0, 6)
  const rest = categories.slice(6)
  const restRevenue = rest.reduce((acc, c) => acc + c.revenue, 0)

  return (
    <DashCard className="flex flex-col">
      <CardHeading
        icon={LayoutGrid}
        title="Category performance"
        subtitle="Which parts of the menu carry the business"
      />

      {categories.length === 0 ? (
        <EmptyState
          icon={LayoutGrid}
          title="No category sales"
          description="Sales grouped by category will appear here."
          className="flex-1"
        />
      ) : (
        <div className="p-5 space-y-5">
          {/* One series, one colour. Bar length already ranks these — fading
              the hue down the list would re-encode the same thing twice. */}
          {visible.map((category, i) => (
            <div key={category.key} style={{ animationDelay: `${i * 60}ms` }}>
              <div className="flex items-center justify-between gap-3 mb-2">
                <span className="text-sm text-title truncate">
                  {category.label}
                </span>
                <span className="text-sm font-medium text-title tabular-nums shrink-0">
                  {formatCurrency(category.revenue)}
                </span>
              </div>

              <ShareBar value={category.share} />

              <p className="text-xs text-soft mt-2">
                {formatNumber(category.orders)} units ·{" "}
                {formatPercent(category.share, 1)} of revenue
              </p>
            </div>
          ))}

          {rest.length > 0 && (
            <p className="text-xs text-soft pt-4 border-t border-border">
              + {rest.length} more {rest.length === 1 ? "category" : "categories"}{" "}
              contributing {formatCurrency(restRevenue)}
            </p>
          )}
        </div>
      )}
    </DashCard>
  )
}
