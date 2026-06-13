import { getDashboardStats } from "@/lib/actions/dashboard"
import { auth } from "@/auth"
import {
  ShoppingBag,
  Clock,
  TrendingUp,
  BadgeAlert,
} from "lucide-react"
import Link from "next/link"

// ─── Status Badge ─────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    NEW: "bg-[#eff6ff] text-[#2563eb] border-[#bfdbfe]",
    CONFIRMED: "bg-[#f5f3ff] text-[#7c3aed] border-[#ddd6fe]",
    PREPARING: "bg-[#fefce8] text-[#ca8a04] border-[#fde68a]",
    READY: "bg-[#fff7ed] text-[#f97316] border-[#fed7aa]",
    COMPLETED: "bg-[#f0fdf4] text-[#16a34a] border-[#bbf7d0]",
    CANCELLED: "bg-[#fef2f2] text-[#dc2626] border-[#fecaca]",
  }

  return (
    <span className={`
      text-xs font-medium px-2.5 py-0.5 rounded-full border
      ${styles[status] ?? styles.NEW}
    `}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  )
}

// ─── Order Type Badge ──────────────────────────────────

function OrderTypeBadge({ type }: { type: string }) {
  const icons: Record<string, string> = {
    DINE_IN: "🍽",
    TAKEAWAY: "🥡",
    DELIVERY: "🛵",
  }

  return (
    <span className="text-xs text-[#6b7280]">
      {icons[type]} {type.replace("_", " ")}
    </span>
  )
}

// ─── Stats Card ───────────────────────────────────────

function StatsCard({
  label,
  value,
  icon: Icon,
  iconColor,
  iconBg,
  prefix = "",
  suffix = "",
  alert = false,
}: {
  label: string
  value: number
  icon: typeof ShoppingBag
  iconColor: string
  iconBg: string
  prefix?: string
  suffix?: string
  alert?: boolean
}) {
  return (
    <div className={`
      bg-white border rounded-xl p-6 shadow-sm
      hover:shadow-md hover:border-[#d1d5db]
      transition-all duration-200
      ${alert && value > 0 ? "border-[#fecaca]" : "border-[#e5e7eb]"}
    `}>
      <div className="flex items-start justify-between mb-4">
        <p className="text-sm font-medium text-[#6b7280]">{label}</p>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBg}`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      </div>
      <p className={`
        text-3xl font-bold
        ${alert && value > 0 ? "text-[#dc2626]" : "text-[#111111]"}
      `}>
        {prefix}{value.toLocaleString()}{suffix}
      </p>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────

export default async function DashboardPage() {
  const session = await auth()
  const stats = await getDashboardStats()

  if (!stats) return null

  return (
    <div className="space-y-6">

      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-bold text-title">
          Good day, {session?.user.name} 👋
        </h2>
        <p className="text-sm text-label mt-1">
          Here is what is happening at your restaurant today.
        </p>
      </div>

      {/* Pending Alert Banner */}
      {stats.pendingOrders > 0 && (
        <div className="bg-[#fef2f2] border border-[#fecaca] rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BadgeAlert className="w-5 h-5 text-[#dc2626]" />
            <p className="text-sm font-medium text-[#991b1b]">
              You have {stats.pendingOrders} new {stats.pendingOrders === 1 ? "order" : "orders"} waiting for action
            </p>
          </div>
          <Link
            href="/dashboard/orders"
            className="text-xs font-medium text-[#dc2626] hover:underline"
          >
            View Orders →
          </Link>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsCard
          label="Total Orders Today"
          value={stats.totalOrdersToday}
          icon={ShoppingBag}
          iconColor="text-[#f97316]"
          iconBg="bg-[#fff7ed]"
        />
        <StatsCard
          label="Revenue Today"
          value={stats.revenueToday}
          icon={TrendingUp}
          iconColor="text-[#16a34a]"
          iconBg="bg-[#f0fdf4]"
          prefix="Rs. "
        />
        <StatsCard
          label="Pending Orders"
          value={stats.pendingOrders}
          icon={Clock}
          iconColor="text-[#dc2626]"
          iconBg="bg-[#fef2f2]"
          alert={true}
        />
      </div>

      {/* Recent Orders */}
      <div className="bg-white border border-[#e5e7eb] rounded-xl shadow-sm overflow-hidden">

        {/* Table Header */}
        <div className="px-6 py-4 border-b border-[#f3f4f6] flex items-center justify-between">
          <h3 className="text-base font-semibold text-[#111111]">
            Recent Orders
          </h3>
          <Link
            href="/dashboard/orders"
            className="text-xs font-medium text-[#f97316] hover:underline"
          >
            View all →
          </Link>
        </div>

        {/* Table */}
        {stats.recentOrders.length === 0 ? (

          // Empty State
          <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#f9fafb] border border-[#e5e7eb] flex items-center justify-center mb-4">
              <ShoppingBag className="w-8 h-8 text-[#9ca3af]" />
            </div>
            <p className="text-base font-semibold text-[#111111] mb-1">
              No orders yet
            </p>
            <p className="text-sm text-[#6b7280]">
              Orders will appear here when customers place them
            </p>
          </div>

        ) : (

          <table className="w-full">
            <thead>
              <tr className="bg-[#f9fafb] border-b border-[#e5e7eb]">
                <th className="text-xs font-semibold uppercase tracking-wider text-[#9ca3af] px-6 py-3 text-left">
                  Order
                </th>
                <th className="text-xs font-semibold uppercase tracking-wider text-[#9ca3af] px-6 py-3 text-left">
                  Type
                </th>
                <th className="text-xs font-semibold uppercase tracking-wider text-[#9ca3af] px-6 py-3 text-left">
                  Customer
                </th>
                <th className="text-xs font-semibold uppercase tracking-wider text-[#9ca3af] px-6 py-3 text-left">
                  Items
                </th>
                <th className="text-xs font-semibold uppercase tracking-wider text-[#9ca3af] px-6 py-3 text-right">
                  Total
                </th>
                <th className="text-xs font-semibold uppercase tracking-wider text-[#9ca3af] px-6 py-3 text-left">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.map((order, index) => (
                <tr
                  key={order.id}
                  className={`
                    hover:bg-[#f9fafb] transition-colors duration-150 cursor-pointer
                    ${index !== stats.recentOrders.length - 1 ? "border-b border-[#f3f4f6]" : ""}
                  `}
                >
                  <td className="px-6 py-4">
                    <Link href={`/dashboard/orders`}>
                      <span className="text-sm font-semibold text-[#111111]">
                        #{order.orderNumber}
                      </span>
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <OrderTypeBadge type={order.type} />
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-[#111111]">
                      {order.customerName}
                    </p>
                    <p className="text-xs text-[#9ca3af]">
                      {order.customerPhone}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-[#6b7280]">
                      {order.items.length} {order.items.length === 1 ? "item" : "items"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-semibold text-[#111111]">
                      Rs. {order.total.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={order.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

        )}
      </div>

    </div>
  )
}