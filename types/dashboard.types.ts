export type RangeKey = "today" | "7d" | "30d" | "90d"

export const RANGE_OPTIONS: { value: RangeKey; label: string; hint: string }[] = [
  { value: "today", label: "Today", hint: "vs yesterday" },
  { value: "7d", label: "7 days", hint: "vs previous 7 days" },
  { value: "30d", label: "30 days", hint: "vs previous 30 days" },
  { value: "90d", label: "90 days", hint: "vs previous 90 days" },
]

export function parseRange(value?: string | string[]): RangeKey {
  const raw = Array.isArray(value) ? value[0] : value
  const match = RANGE_OPTIONS.find((o) => o.value === raw)
  return match ? match.value : "today"
}

export type TrendPoint = {
  key: string
  label: string
  revenue: number
  orders: number
}

export type ComparisonPoint = {
  revenue: number
  orders: number
}

export type ChannelTrendPoint = {
  key: string
  label: string
  total: number
  values: Record<string, number>
}

export type MetricWithDelta = {
  current: number
  previous: number
  change: number | null
}

export type BreakdownSlice = {
  key: string
  label: string
  orders: number
  revenue: number
  share: number
}

export type TopCustomer = {
  phone: string
  name: string
  orders: number
  spent: number
  lastOrderAt: string
}

export type OverviewData = {
  rangeLabel: string
  comparisonLabel: string
  granularity: "hour" | "day"

  revenue: MetricWithDelta
  orders: MetricWithDelta
  avgOrderValue: MetricWithDelta
  cancelRate: MetricWithDelta

  collected: number
  outstanding: number
  discountGiven: number
  deliveryFeeEarned: number
  itemsSold: number
  avgFulfillmentMinutes: number | null
  cancelledValue: number

  uniqueCustomers: number
  repeatCustomers: number
  newCustomers: number
  repeatRate: number
  topCustomers: TopCustomer[]

  trend: TrendPoint[]
  previousTrend: ComparisonPoint[]
  channelTrend: ChannelTrendPoint[]
  channelKeys: string[]
  revenueSparkline: number[]
  ordersSparkline: number[]
  hourly: { hour: number; orders: number; revenue: number }[]
  busiestHour: number | null

  orderTypes: BreakdownSlice[]
  payments: BreakdownSlice[]
  deliveryAreas: BreakdownSlice[]

  hasData: boolean
}

export type TopItem = {
  id: string
  name: string
  category: string
  imageUrl: string | null
  quantity: number
  revenue: number
  share: number
  isAvailable: boolean
}

export type MenuPerformance = {
  topItems: TopItem[]
  categories: BreakdownSlice[]
  totalItems: number
  availableItems: number
  unavailableItems: number
  unavailableList: { id: string; name: string; category: string }[]
  noSaleItems: number
  noSaleList: { id: string; name: string; category: string }[]
  bestsellerCount: number
  hiddenCategories: number
  activeDiscounts: number
}
