"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import {
  addDays,
  differenceInCalendarDays,
  eachDayOfInterval,
  format,
  startOfDay,
  subDays,
  subMilliseconds,
} from "date-fns"
import type {
  BreakdownSlice,
  ChannelTrendPoint,
  ComparisonPoint,
  MenuPerformance,
  OverviewData,
  RangeKey,
  TopCustomer,
  TopItem,
  TrendPoint,
} from "@/types/dashboard.types"

const ORDER_TYPE_LABELS: Record<string, string> = {
  DINE_IN: "Dine In",
  TAKEAWAY: "Takeaway",
  DELIVERY: "Delivery",
}

const PAYMENT_LABELS: Record<string, string> = {
  CASH: "Cash",
  CARD: "Card",
  ONLINE: "Online",
}

type ResolvedRange = {
  start: Date
  end: Date
  prevStart: Date
  prevEnd: Date
  days: number
  granularity: "hour" | "day"
  rangeLabel: string
  comparisonLabel: string
}

function resolveRange(range: RangeKey): ResolvedRange {
  const end = new Date()

  const days = range === "today" ? 1 : range === "7d" ? 7 : range === "30d" ? 30 : 90
  const start = range === "today" ? startOfDay(end) : startOfDay(subDays(end, days - 1))

  const windowMs = end.getTime() - start.getTime()
  const prevEnd = subMilliseconds(start, 1)
  const prevStart = subMilliseconds(prevEnd, windowMs)

  return {
    start,
    end,
    prevStart,
    prevEnd,
    days,
    granularity: range === "today" ? "hour" : "day",
    rangeLabel:
      range === "today"
        ? "Today"
        : `${format(start, "MMM d")} – ${format(end, "MMM d")}`,
    comparisonLabel:
      range === "today" ? "vs yesterday" : `vs previous ${days} days`,
  }
}

function change(current: number, previous: number): number | null {
  if (!previous) return current > 0 ? null : 0
  return ((current - previous) / previous) * 100
}

function share(value: number, total: number) {
  return total > 0 ? (value / total) * 100 : 0
}

function hourLabel(hour: number) {
  const suffix = hour < 12 ? "AM" : "PM"
  const h = hour % 12 === 0 ? 12 : hour % 12
  return `${h} ${suffix}`
}

export async function getDashboardOverview(range: RangeKey): Promise<OverviewData | null> {
  const session = await auth()
  if (!session) return null

  const restaurantId = session.user.restaurantId
  const r = resolveRange(range)

  const [rows, itemsAgg, deliveryAreas] = await Promise.all([
    prisma.order.findMany({
      where: {
        restaurantId,
        createdAt: { gte: r.prevStart, lte: r.end },
      },
      select: {
        createdAt: true,
        updatedAt: true,
        status: true,
        type: true,
        paymentMethod: true,
        paymentStatus: true,
        subtotal: true,
        deliveryFee: true,
        discount: true,
        total: true,
        customerName: true,
        customerPhone: true,
        deliveryAreaId: true,
      },
    }),

    prisma.orderItem.aggregate({
      where: {
        order: {
          restaurantId,
          createdAt: { gte: r.start, lte: r.end },
          status: { not: "CANCELLED" },
        },
      },
      _sum: { quantity: true },
    }),

    prisma.deliveryArea.findMany({
      where: { restaurantId },
      select: { id: true, name: true },
    }),
  ])

  const current = rows.filter((o) => o.createdAt >= r.start)
  const previous = rows.filter((o) => o.createdAt <= r.prevEnd && o.createdAt >= r.prevStart)

  const live = current.filter((o) => o.status !== "CANCELLED")
  const prevLive = previous.filter((o) => o.status !== "CANCELLED")

  const revenue = sum(live, (o) => o.total)
  const prevRevenue = sum(prevLive, (o) => o.total)

  const aov = live.length ? revenue / live.length : 0
  const prevAov = prevLive.length ? prevRevenue / prevLive.length : 0

  const cancelled = current.filter((o) => o.status === "CANCELLED")
  const prevCancelled = previous.filter((o) => o.status === "CANCELLED")
  const cancelRate = current.length ? (cancelled.length / current.length) * 100 : 0
  const prevCancelRate = previous.length
    ? (prevCancelled.length / previous.length) * 100
    : 0

  const paid = live.filter((o) => o.paymentStatus === "PAID")
  const collected = sum(paid, (o) => o.total)
  const outstanding = sum(
    live.filter((o) => o.paymentStatus === "PENDING"),
    (o) => o.total,
  )

  const completed = live.filter((o) => o.status === "COMPLETED")
  const avgFulfillmentMinutes = completed.length
    ? sum(completed, (o) => (o.updatedAt.getTime() - o.createdAt.getTime()) / 60000) /
      completed.length
    : null

  const trend = buildTrend(live, r)
  const previousTrend = buildComparison(prevLive, r, trend.length)
  const channelTrend = buildChannelTrend(live, r)

  const channelKeys = Object.keys(ORDER_TYPE_LABELS).filter((type) =>
    channelTrend.some((point) => (point.values[type] ?? 0) > 0),
  )

  const hourly = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    orders: 0,
    revenue: 0,
  }))
  for (const o of live) {
    const bucket = hourly[o.createdAt.getHours()]
    bucket.orders += 1
    bucket.revenue += o.total
  }
  const busiest = hourly.reduce(
    (best, b) => (b.orders > (hourly[best]?.orders ?? -1) ? b.hour : best),
    0,
  )

  const orderTypes = groupSlices(live, (o) => o.type, ORDER_TYPE_LABELS, revenue)
  const payments = groupSlices(live, (o) => o.paymentMethod, PAYMENT_LABELS, revenue)

  const areaNames = Object.fromEntries(deliveryAreas.map((a) => [a.id, a.name]))
  const deliveryOrders = live.filter((o) => o.type === "DELIVERY")
  const deliveryRevenue = sum(deliveryOrders, (o) => o.total)
  const areaSlices = groupSlices(
    deliveryOrders,
    (o) => o.deliveryAreaId ?? "unassigned",
    { ...areaNames, unassigned: "Unassigned" },
    deliveryRevenue,
  )

  const customers = await buildCustomerInsights(restaurantId, live, r.start)

  return {
    rangeLabel: r.rangeLabel,
    comparisonLabel: r.comparisonLabel,
    granularity: r.granularity,

    revenue: { current: revenue, previous: prevRevenue, change: change(revenue, prevRevenue) },
    orders: {
      current: live.length,
      previous: prevLive.length,
      change: change(live.length, prevLive.length),
    },
    avgOrderValue: { current: aov, previous: prevAov, change: change(aov, prevAov) },
    cancelRate: {
      current: cancelRate,
      previous: prevCancelRate,
      change: change(cancelRate, prevCancelRate),
    },

    collected,
    outstanding,
    discountGiven: sum(live, (o) => o.discount),
    deliveryFeeEarned: sum(live, (o) => o.deliveryFee),
    itemsSold: itemsAgg._sum.quantity ?? 0,
    avgFulfillmentMinutes,
    cancelledValue: sum(cancelled, (o) => o.total),

    ...customers,

    trend,
    previousTrend,
    channelTrend,
    channelKeys,
    revenueSparkline: trend.map((t) => t.revenue),
    ordersSparkline: trend.map((t) => t.orders),
    hourly,
    busiestHour: hourly.some((h) => h.orders > 0) ? busiest : null,

    orderTypes,
    payments,
    deliveryAreas: areaSlices,

    hasData: current.length > 0,
  }
}

export async function getMenuPerformance(range: RangeKey): Promise<MenuPerformance | null> {
  const session = await auth()
  if (!session) return null

  const restaurantId = session.user.restaurantId
  const r = resolveRange(range)

  const [sold, menuItems, hiddenCategories, activeDiscounts] = await Promise.all([
    prisma.orderItem.groupBy({
      by: ["menuItemId"],
      where: {
        order: {
          restaurantId,
          createdAt: { gte: r.start, lte: r.end },
          status: { not: "CANCELLED" },
        },
      },
      _sum: { quantity: true, totalPrice: true },
    }),

    prisma.menuItem.findMany({
      where: { restaurantId },
      select: {
        id: true,
        name: true,
        isAvailable: true,
        isBestseller: true,
        category: { select: { name: true } },
        images: { select: { url: true }, orderBy: { sortOrder: "asc" }, take: 1 },
      },
    }),

    prisma.category.count({ where: { restaurantId, isVisible: false } }),

    prisma.discount.count({ where: { restaurantId, isActive: true } }),
  ])

  const byId = new Map(menuItems.map((m) => [m.id, m]))
  const totalRevenue = sold.reduce((acc, s) => acc + (s._sum.totalPrice ?? 0), 0)

  const topItems: TopItem[] = sold
    .map((s) => {
      const item = byId.get(s.menuItemId)
      const revenue = s._sum.totalPrice ?? 0
      return {
        id: s.menuItemId,
        name: item?.name ?? "Deleted item",
        category: item?.category.name ?? "—",
        imageUrl: item?.images[0]?.url ?? null,
        quantity: s._sum.quantity ?? 0,
        revenue,
        share: share(revenue, totalRevenue),
        isAvailable: item?.isAvailable ?? false,
      }
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8)

  const categoryTotals = new Map<string, { orders: number; revenue: number }>()
  for (const s of sold) {
    const name = byId.get(s.menuItemId)?.category.name ?? "Uncategorised"
    const entry = categoryTotals.get(name) ?? { orders: 0, revenue: 0 }
    entry.orders += s._sum.quantity ?? 0
    entry.revenue += s._sum.totalPrice ?? 0
    categoryTotals.set(name, entry)
  }

  const categories: BreakdownSlice[] = [...categoryTotals.entries()]
    .map(([name, v]) => ({
      key: name,
      label: name,
      orders: v.orders,
      revenue: v.revenue,
      share: share(v.revenue, totalRevenue),
    }))
    .sort((a, b) => b.revenue - a.revenue)

  const soldIds = new Set(sold.map((s) => s.menuItemId))
  const noSale = menuItems.filter((m) => !soldIds.has(m.id))
  const unavailable = menuItems.filter((m) => !m.isAvailable)

  return {
    topItems,
    categories,
    totalItems: menuItems.length,
    availableItems: menuItems.length - unavailable.length,
    unavailableItems: unavailable.length,
    unavailableList: unavailable.slice(0, 5).map((m) => ({
      id: m.id,
      name: m.name,
      category: m.category.name,
    })),
    noSaleItems: noSale.length,
    noSaleList: noSale.slice(0, 5).map((m) => ({
      id: m.id,
      name: m.name,
      category: m.category.name,
    })),
    bestsellerCount: menuItems.filter((m) => m.isBestseller).length,
    hiddenCategories,
    activeDiscounts,
  }
}

type OrderRow = {
  createdAt: Date
  total: number
  customerName: string
  customerPhone: string
}

function sum<T>(rows: T[], pick: (row: T) => number) {
  return rows.reduce((acc, row) => acc + (pick(row) || 0), 0)
}

function bucketPlan(r: ResolvedRange, anchor: Date = r.start) {
  if (r.granularity === "hour") {
    return {
      slots: Array.from({ length: 24 }, (_, hour) => ({
        key: String(hour),
        label: hourLabel(hour),
      })),
      indexOf: (d: Date) => d.getHours(),
    }
  }

  const labelFormat = r.days <= 7 ? "EEE" : "MMM d"
  const days = eachDayOfInterval({ start: anchor, end: addDays(anchor, r.days - 1) })

  return {
    slots: days.map((d) => ({
      key: format(d, "yyyy-MM-dd"),
      label: format(d, labelFormat),
    })),
    indexOf: (d: Date) => differenceInCalendarDays(d, anchor),
  }
}

function buildTrend(orders: { createdAt: Date; total: number }[], r: ResolvedRange): TrendPoint[] {
  const { slots, indexOf } = bucketPlan(r)
  const buckets: TrendPoint[] = slots.map((s) => ({ ...s, revenue: 0, orders: 0 }))

  for (const o of orders) {
    const bucket = buckets[indexOf(o.createdAt)]
    if (!bucket) continue
    bucket.revenue += o.total
    bucket.orders += 1
  }

  return buckets
}

function buildComparison(
  orders: { createdAt: Date; total: number }[],
  r: ResolvedRange,
  length: number,
): ComparisonPoint[] {
  const { indexOf } = bucketPlan(r, startOfDay(r.prevStart))
  const buckets: ComparisonPoint[] = Array.from({ length }, () => ({
    revenue: 0,
    orders: 0,
  }))

  for (const o of orders) {
    const bucket = buckets[indexOf(o.createdAt)]
    if (!bucket) continue
    bucket.revenue += o.total
    bucket.orders += 1
  }

  return buckets
}

function buildChannelTrend(
  orders: { createdAt: Date; total: number; type: string }[],
  r: ResolvedRange,
): ChannelTrendPoint[] {
  const { slots, indexOf } = bucketPlan(r)
  const buckets: ChannelTrendPoint[] = slots.map((s) => ({
    ...s,
    total: 0,
    values: {},
  }))

  for (const o of orders) {
    const bucket = buckets[indexOf(o.createdAt)]
    if (!bucket) continue
    bucket.values[o.type] = (bucket.values[o.type] ?? 0) + o.total
    bucket.total += o.total
  }

  return buckets
}

function groupSlices<T extends { total: number }>(
  rows: T[],
  pick: (row: T) => string,
  labels: Record<string, string>,
  totalRevenue: number,
): BreakdownSlice[] {
  const map = new Map<string, { orders: number; revenue: number }>()

  for (const row of rows) {
    const key = pick(row)
    const entry = map.get(key) ?? { orders: 0, revenue: 0 }
    entry.orders += 1
    entry.revenue += row.total
    map.set(key, entry)
  }

  return [...map.entries()]
    .map(([key, v]) => ({
      key,
      label: labels[key] ?? key,
      orders: v.orders,
      revenue: v.revenue,
      share: share(v.revenue, totalRevenue),
    }))
    .sort((a, b) => b.revenue - a.revenue)
}

async function buildCustomerInsights(
  restaurantId: string,
  orders: OrderRow[],
  periodStart: Date,
) {
  const byPhone = new Map<string, TopCustomer>()

  for (const o of orders) {
    const phone = o.customerPhone?.trim()
    if (!phone) continue

    const entry = byPhone.get(phone)
    if (entry) {
      entry.orders += 1
      entry.spent += o.total
      if (new Date(entry.lastOrderAt) < o.createdAt) {
        entry.lastOrderAt = o.createdAt.toISOString()
        entry.name = o.customerName
      }
    } else {
      byPhone.set(phone, {
        phone,
        name: o.customerName,
        orders: 1,
        spent: o.total,
        lastOrderAt: o.createdAt.toISOString(),
      })
    }
  }

  const phones = [...byPhone.keys()]
  let returningPhones = new Set<string>()

  if (phones.length > 0) {
    const prior = await prisma.order.groupBy({
      by: ["customerPhone"],
      where: {
        restaurantId,
        createdAt: { lt: periodStart },
        customerPhone: { in: phones.slice(0, 1000) },
      },
    })
    returningPhones = new Set(prior.map((p) => p.customerPhone))
  }

  for (const [phone, c] of byPhone) {
    if (c.orders > 1) returningPhones.add(phone)
  }

  const repeatCustomers = phones.filter((p) => returningPhones.has(p)).length

  return {
    uniqueCustomers: phones.length,
    repeatCustomers,
    newCustomers: phones.length - repeatCustomers,
    repeatRate: share(repeatCustomers, phones.length),
    topCustomers: [...byPhone.values()]
      .sort((a, b) => b.spent - a.spent)
      .slice(0, 5),
  }
}
