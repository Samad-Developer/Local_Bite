import { Suspense } from "react"
import {
  getDashboardOverview,
  getMenuPerformance,
} from "@/lib/actions/dashboard/dashboard"
import { parseRange } from "@/types/dashboard.types"

import DashboardHeader from "@/components/dashboard/overview/dashboard-header"
import KpiCards from "@/components/dashboard/overview/kpi-cards"
import RevenueChart from "@/components/dashboard/overview/revenue-chart"
import ChannelTrend from "@/components/dashboard/overview/channel-trend"
import SalesMix from "@/components/dashboard/overview/sales-mix"
import PaymentMix from "@/components/dashboard/overview/payment-mix"
import TopItems from "@/components/dashboard/overview/top-items"
import CategoryPerformance from "@/components/dashboard/overview/category-performance"
import MenuHealth from "@/components/dashboard/overview/menu-health"
import CustomerInsights from "@/components/dashboard/overview/customer-insights"
import DeliveryAreas from "@/components/dashboard/overview/delivery-areas"
import { Section } from "@/components/dashboard/overview/ui"
import {
  HeaderSkeleton,
  MenuSkeleton,
  OverviewSkeleton,
} from "@/components/dashboard/overview/skeletons"

type SearchParams = Promise<{ range?: string }>

export default function DashboardPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  // Every section reads its own data so slow queries never block the rest.
  return (
    <div className="space-y-8 pb-4">
      <Suspense fallback={<HeaderSkeleton />}>
        <HeaderSection searchParams={searchParams} />
      </Suspense>

      <Suspense fallback={<OverviewSkeleton />}>
        <PerformanceSection searchParams={searchParams} />
      </Suspense>

      <Suspense fallback={<MenuSkeleton />}>
        <MenuSection searchParams={searchParams} />
      </Suspense>
    </div>
  )
}

// ─── Sections ─────────────────────────────────────────

async function HeaderSection({ searchParams }: { searchParams: SearchParams }) {
  const range = parseRange((await searchParams).range)
  const label =
    range === "today"
      ? "Today"
      : range === "7d"
        ? "Last 7 days"
        : range === "30d"
          ? "Last 30 days"
          : "Last 90 days"

  return <DashboardHeader range={range} rangeLabel={label} />
}

async function PerformanceSection({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const range = parseRange((await searchParams).range)
  const data = await getDashboardOverview(range)
  if (!data) return null

  const showDeliveryZones = data.deliveryAreas.length > 0
  const period = `${data.rangeLabel} · ${data.comparisonLabel}`

  // Sales and Customers share one query, so they render from one section.
  return (
    <div className="space-y-8">
      <KpiCards data={data} />

      <Section title="Sales">
        <div className="grid gap-5 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <RevenueChart
              data={data.trend}
              previous={data.previousTrend}
              subtitle={period}
              comparisonLabel={data.comparisonLabel}
            />
          </div>
          <SalesMix slices={data.orderTypes} />
        </div>

        <div className="grid gap-5 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <ChannelTrend
              points={data.channelTrend}
              keys={data.channelKeys}
              subtitle={data.rangeLabel}
            />
          </div>
          <PaymentMix
            slices={data.payments}
            collected={data.collected}
            outstanding={data.outstanding}
          />
        </div>
      </Section>

      <Section title="Customers">
        <div className={showDeliveryZones ? "grid gap-5 xl:grid-cols-2" : "grid"}>
          <CustomerInsights data={data} />
          {showDeliveryZones && <DeliveryAreas areas={data.deliveryAreas} />}
        </div>
      </Section>
    </div>
  )
}

async function MenuSection({ searchParams }: { searchParams: SearchParams }) {
  const range = parseRange((await searchParams).range)
  const menu = await getMenuPerformance(range)
  if (!menu) return null

  return (
    <Section title="Menu">
      <div className="grid gap-5 xl:grid-cols-2">
        <TopItems items={menu.topItems} />
        <CategoryPerformance categories={menu.categories} />
      </div>

      <MenuHealth data={menu} />
    </Section>
  )
}
