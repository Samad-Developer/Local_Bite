"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { toast } from "sonner"
import {
  ArrowLeft,
  Bike,
  Check,
  ChefHat,
  Clock,
  Flame,
  Hash,
  Leaf,
  MapPin,
  Phone,
  Receipt,
  ShoppingBag,
  Timer,
  UtensilsCrossed,
  Wallet,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { updateOrderStatus } from "@/lib/actions/orders/orders"
import type { OrderDetail } from "@/lib/actions/orders/orders"
import type { OrderStatus } from "@prisma/client"

const PIPELINE = [
  { status: "NEW", label: "Placed", icon: ShoppingBag },
  { status: "CONFIRMED", label: "Confirmed", icon: Check },
  { status: "PREPARING", label: "Preparing", icon: ChefHat },
  { status: "READY", label: "Ready", icon: UtensilsCrossed },
  { status: "COMPLETED", label: "Completed", icon: Check },
] as const

const NEXT_ACTION: Record<string, { next: OrderStatus; label: string } | null> = {
  NEW: { next: "CONFIRMED", label: "Confirm order" },
  CONFIRMED: { next: "PREPARING", label: "Start preparing" },
  PREPARING: { next: "READY", label: "Mark as ready" },
  READY: { next: "COMPLETED", label: "Complete order" },
  COMPLETED: null,
  CANCELLED: null,
}

const STATUS_CHIP: Record<string, string> = {
  NEW: "bg-[#eff6ff] text-[#2563eb] border-[#bfdbfe]",
  CONFIRMED: "bg-[#f5f3ff] text-[#7c3aed] border-[#ddd6fe]",
  PREPARING: "bg-[#fefce8] text-[#ca8a04] border-[#fde68a]",
  READY: "bg-[#fff7ed] text-[#f97316] border-[#fed7aa]",
  COMPLETED: "bg-[#f0fdf4] text-[#16a34a] border-[#bbf7d0]",
  CANCELLED: "bg-[#fef2f2] text-[#dc2626] border-[#fecaca]",
}

const STATUS_LABEL: Record<string, string> = {
  NEW: "New",
  CONFIRMED: "Confirmed",
  PREPARING: "Preparing",
  READY: "Ready",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
}

const TYPE_META: Record<string, { label: string; icon: typeof Bike }> = {
  DINE_IN: { label: "Dine in", icon: UtensilsCrossed },
  TAKEAWAY: { label: "Takeaway", icon: ShoppingBag },
  DELIVERY: { label: "Delivery", icon: Bike },
}

const SPICY_LABEL: Record<string, string> = {
  MILD: "Mild",
  MEDIUM: "Medium",
  HOT: "Hot",
}

const CARD =
  "bg-surface border border-border rounded-xl shadow-[0_1px_2px_rgba(17,17,17,0.04),0_8px_24px_-12px_rgba(17,17,17,0.10)]"

export default function OrderDetailClient({ order }: { order: OrderDetail }) {
  const [optimistic, setOptimistic] = useState<{
    base: string
    value: string
  } | null>(null)

  const currentStatus =
    optimistic && optimistic.base === order.status ? optimistic.value : order.status

  const [submitting, setSubmitting] = useState<"advance" | "cancel" | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const nextAction = NEXT_ACTION[currentStatus]
  const cancelled = currentStatus === "CANCELLED"
  const settled = cancelled || currentStatus === "COMPLETED"

  const type = TYPE_META[order.type] ?? TYPE_META.DINE_IN
  const TypeIcon = type.icon
  const paid = order.paymentStatus === "PAID"

  const totalUnits = order.items.reduce((n, i) => n + i.quantity, 0)
  const longestPrep = order.items.reduce(
    (max, i) => Math.max(max, i.menuItem.preparationTime ?? 0),
    0,
  )

  async function run(
    kind: "advance" | "cancel",
    next: OrderStatus,
    successMessage?: string,
  ) {
    if (submitting) return
    setSubmitting(kind)
    try {
      const result = await updateOrderStatus(order.id, next)
      if (result?.success) {
        setOptimistic({ base: order.status, value: next })
        setConfirmOpen(false)
        toast.success(successMessage ?? result.message)
      } else {
        toast.error(result?.error ?? "Failed to update status")
      }
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setSubmitting(null)
    }
  }

  return (
    <div className="w-full space-y-5 pb-10">
      <div className={cn(CARD, "px-5 py-4 lg:px-6 lg:py-5")}>
        <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
          <div className="flex items-start gap-3 min-w-0">
            <Link href={{ pathname: "/orders" }} aria-label="Back to orders">
              <Button variant="ghost" size="icon" className="w-9 h-9 mt-0.5 shrink-0">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>

            <div className="min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-[26px] font-semibold text-title tracking-tight leading-none">
                  Order #{order.orderNumber}
                </h1>
                <span
                  className={cn(
                    "text-xs font-medium px-2.5 py-1 rounded-full border",
                    STATUS_CHIP[currentStatus],
                  )}
                >
                  {STATUS_LABEL[currentStatus]}
                </span>
              </div>

              <div className="flex items-center gap-3 flex-wrap mt-2.5 text-xs text-soft">
                <span className="inline-flex items-center gap-1.5">
                  <TypeIcon className="w-3.5 h-3.5" />
                  {type.label}
                </span>
                <span>{formatFull(order.createdAt)}</span>
                <RelativeTime date={order.createdAt} />
              </div>
            </div>
          </div>

          <div className="text-right shrink-0">
            <p className="text-[26px] font-semibold text-title tracking-tight leading-none">
              {money(order.total)}
            </p>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 text-xs font-medium mt-2",
                paid ? "text-[#16a34a]" : "text-[#ca8a04]",
              )}
            >
              <Wallet className="w-3.5 h-3.5" />
              {paid ? "Paid" : "Payment pending"} · {titleCase(order.paymentMethod)}
            </span>
          </div>
        </div>
      </div>

      <Progress status={currentStatus} />

      <div
        className={cn(
          CARD,
          "grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-px bg-border overflow-hidden",
        )}
      >
        <Fact icon={TypeIcon} label="Order type" value={type.label} />
        <Fact
          icon={Hash}
          label="Items"
          value={`${totalUnits}`}
          hint={`${order.items.length} line${order.items.length === 1 ? "" : "s"}`}
        />
        <Fact
          icon={Wallet}
          label="Payment"
          value={titleCase(order.paymentMethod)}
          hint={paid ? "Paid" : "Pending"}
          tone={paid ? "good" : "warn"}
        />
        <Fact
          icon={Timer}
          label="Longest prep"
          value={longestPrep > 0 ? `${longestPrep} min` : "—"}
          hint="Slowest item"
        />
        <Fact
          icon={Clock}
          label="Placed"
          value={formatTime(order.createdAt)}
          hint={formatDay(order.createdAt)}
        />
        <Fact
          icon={Receipt}
          label="Last updated"
          value={formatTime(order.updatedAt)}
          hint={formatDay(order.updatedAt)}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-12 items-start">
        <div className="xl:col-span-8 space-y-5">
        <section className={CARD}>
          <header className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-border">
            <h2 className="text-sm font-semibold text-title">Items</h2>
            <span className="text-xs text-soft tabular-nums">
              {order.items.length} line{order.items.length === 1 ? "" : "s"} ·{" "}
              {totalUnits} item{totalUnits === 1 ? "" : "s"}
            </span>
          </header>

          <ul className="divide-y divide-border">
            {order.items.map((item) => {
              const menuItem = item.menuItem
              const spicy = SPICY_LABEL[menuItem.spicyLevel]

              return (
                <li
                  key={item.id}
                  className="flex items-start gap-4 px-5 py-4 hover:bg-elevated/60 transition-colors duration-150"
                >
                  <div className="w-14 h-14 rounded-lg overflow-hidden border border-border bg-elevated shrink-0">
                    {menuItem.images?.[0]?.url ? (
                      <Image
                        src={menuItem.images[0].url}
                        alt=""
                        width={56}
                        height={56}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <UtensilsCrossed className="w-4 h-4 text-[#d1d5db]" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-title">
                          {menuItem.name}
                        </p>

                        <div className="flex items-center gap-2 flex-wrap mt-1 text-xs text-soft">
                          {menuItem.category?.name && (
                            <span>{menuItem.category.name}</span>
                          )}
                          {menuItem.foodType === "VEG" && (
                            <span className="inline-flex items-center gap-1 text-[#16a34a]">
                              <Leaf className="w-3 h-3" />
                              Veg
                            </span>
                          )}
                          {spicy && (
                            <span className="inline-flex items-center gap-1 text-[#dc2626]">
                              <Flame className="w-3 h-3" />
                              {spicy}
                            </span>
                          )}
                          {menuItem.preparationTime > 0 && (
                            <span className="inline-flex items-center gap-1">
                              <Timer className="w-3 h-3" />
                              {menuItem.preparationTime} min
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold text-title tabular-nums">
                          {money(item.totalPrice)}
                        </p>
                        <p className="text-xs text-soft tabular-nums mt-1">
                          {item.quantity} × {money(item.unitPrice)}
                        </p>
                      </div>
                    </div>

                    {menuItem.description && (
                      <p className="text-xs text-soft mt-2 leading-relaxed line-clamp-2">
                        {menuItem.description}
                      </p>
                    )}

                    {(item.variant || item.addons.length > 0) && (
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {item.variant && (
                          <Tag>
                            {item.variant.name}
                            {item.variant.price > 0 &&
                              ` · ${money(item.variant.price)}`}
                          </Tag>
                        )}
                        {item.addons.map((addon) => (
                          <Tag key={addon.id}>
                            + {addon.name}
                            {addon.price > 0 && ` · ${money(addon.price)}`}
                          </Tag>
                        ))}
                      </div>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>

        </section>

          <div className="grid gap-5 md:grid-cols-2">
            <Timeline order={order} status={currentStatus} />

            <section
              className={cn(
                order.specialNotes
                  ? "bg-[#fff7ed] border border-[#fed7aa] rounded-xl"
                  : CARD,
              )}
            >
              <header
                className={cn(
                  "px-5 py-3.5 border-b",
                  order.specialNotes ? "border-[#fed7aa]" : "border-border",
                )}
              >
                <h2
                  className={cn(
                    "text-sm font-semibold",
                    order.specialNotes ? "text-[#c2410c]" : "text-title",
                  )}
                >
                  Note for the kitchen
                </h2>
              </header>
              <div className="px-5 py-4">
                {order.specialNotes ? (
                  <p className="text-sm text-title leading-relaxed">
                    {order.specialNotes}
                  </p>
                ) : (
                  <p className="text-sm text-soft">
                    No special instructions on this order.
                  </p>
                )}
              </div>
            </section>
          </div>
        </div>

        <div className="xl:col-span-4 space-y-5 xl:sticky xl:top-6">
          <section className={cn(CARD, "p-5 space-y-3")}>
            {nextAction ? (
              <>
                <Button
                  onClick={() => run("advance", nextAction.next)}
                  disabled={submitting !== null}
                  className="w-full h-11 bg-brand hover:bg-brand-hover text-white font-medium"
                >
                  {submitting === "advance" ? "Updating…" : nextAction.label}
                </Button>
                <p className="text-xs text-soft text-center">
                  Moves this order to{" "}
                  {STATUS_LABEL[nextAction.next].toLowerCase()}
                </p>
              </>
            ) : (
              <div
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3.5 py-3",
                  cancelled
                    ? "bg-[#fef2f2] text-[#dc2626]"
                    : "bg-[#f0fdf4] text-[#16a34a]",
                )}
              >
                {cancelled ? (
                  <X className="w-4 h-4 shrink-0" />
                ) : (
                  <Check className="w-4 h-4 shrink-0" />
                )}
                <p className="text-sm font-medium">
                  {cancelled ? "Order cancelled" : "Order completed"}
                </p>
              </div>
            )}

            {!settled && (
              <Button
                onClick={() => setConfirmOpen(true)}
                disabled={submitting !== null}
                variant="outline"
                className="w-full border-border text-[#dc2626] hover:bg-[#fef2f2] hover:text-[#dc2626]"
              >
                Cancel order
              </Button>
            )}
          </section>

          <section className={CARD}>
            <header className="px-5 py-3.5 border-b border-border">
              <h2 className="text-sm font-semibold text-title">Customer</h2>
            </header>

            <div className="px-5 py-4 space-y-3.5">
              <p className="text-sm font-medium text-title">
                {order.customerName}
              </p>

              <a
                href={`tel:${order.customerPhone}`}
                className="flex items-center gap-2.5 text-sm text-label hover:text-brand transition-colors duration-150"
              >
                <Phone className="w-3.5 h-3.5 shrink-0" />
                <span className="tabular-nums">{order.customerPhone}</span>
              </a>

              {order.customerAddress && (
                <div className="flex items-start gap-2.5 text-sm text-label">
                  <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">
                    {order.customerAddress}
                  </span>
                </div>
              )}

              {order.deliveryArea && (
                <div className="flex items-center justify-between gap-3 pt-3.5 border-t border-border">
                  <span className="text-xs text-soft">Delivery zone</span>
                  <span className="text-sm text-title">
                    {order.deliveryArea.name}
                  </span>
                </div>
              )}
            </div>
          </section>

          <section className={CARD}>
            <header className="px-5 py-3.5 border-b border-border">
              <h2 className="text-sm font-semibold text-title">Bill</h2>
            </header>

            <dl className="px-5 py-4 space-y-2.5">
              <Row
                label={`Subtotal (${totalUnits} item${totalUnits === 1 ? "" : "s"})`}
                value={money(order.subtotal)}
              />
              {order.deliveryFee > 0 && (
                <Row label="Delivery fee" value={money(order.deliveryFee)} />
              )}
              {order.discount > 0 && (
                <Row
                  label="Discount"
                  value={`− ${money(order.discount)}`}
                  tone="text-[#16a34a]"
                />
              )}

              <div className="flex items-baseline justify-between pt-3 mt-1 border-t border-border">
                <dt className="text-sm font-semibold text-title">Total</dt>
                <dd className="text-lg font-semibold text-title tabular-nums">
                  {money(order.total)}
                </dd>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <dt className="text-sm text-label">Payment</dt>
                <dd
                  className={cn(
                    "text-sm font-medium",
                    paid ? "text-[#16a34a]" : "text-[#ca8a04]",
                  )}
                >
                  {titleCase(order.paymentMethod)} · {paid ? "Paid" : "Pending"}
                </dd>
              </div>

              {order.items.length > 0 && (
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <dt className="text-sm text-label">Average per item</dt>
                  <dd className="text-sm text-title tabular-nums">
                    {money(order.subtotal / Math.max(1, totalUnits))}
                  </dd>
                </div>
              )}
            </dl>
          </section>
        </div>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Cancel order #{order.orderNumber}?</DialogTitle>
            <DialogDescription>
              This marks the order cancelled for {order.customerName} and
              removes {money(order.total)} from your sales. It can&apos;t be
              undone here.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={submitting !== null}>
                Keep order
              </Button>
            </DialogClose>
            <Button
              onClick={() => run("cancel", "CANCELLED", "Order cancelled")}
              disabled={submitting !== null}
              className="bg-[#dc2626] hover:bg-[#b91c1c] text-white"
            >
              {submitting === "cancel" ? "Cancelling…" : "Cancel order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Progress({ status }: { status: string }) {
  if (status === "CANCELLED") {
    return (
      <div className="flex items-center gap-2.5 bg-[#fef2f2] border border-[#fecaca] rounded-xl px-5 py-3.5">
        <X className="w-4 h-4 text-[#dc2626] shrink-0" />
        <p className="text-sm text-[#dc2626]">
          This order was cancelled and is no longer in the kitchen queue.
        </p>
      </div>
    )
  }

  const index = PIPELINE.findIndex((s) => s.status === status)

  return (
    <ol
      className={cn(
        CARD,
        "flex items-center gap-1 px-5 py-4 lg:px-6 overflow-x-auto",
      )}
    >
      {PIPELINE.map((stage, i) => {
        const done = i < index
        const current = i === index
        const Icon = stage.icon

        return [
          <li
            key={stage.status}
            className="flex items-center gap-2.5 shrink-0"
            aria-current={current ? "step" : undefined}
          >
            <span
              className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full border transition-colors duration-300",
                done && "bg-[#f0fdf4] border-[#bbf7d0] text-[#16a34a]",
                current && "bg-brand border-brand text-white",
                !done && !current && "bg-elevated border-border text-[#9ca3af]",
              )}
            >
              <Icon className="w-3.5 h-3.5" />
            </span>
            <span
              className={cn(
                "text-xs whitespace-nowrap",
                current ? "font-medium text-title" : "text-soft",
              )}
            >
              {stage.label}
            </span>
          </li>,

          i < PIPELINE.length - 1 ? (
            <li
              key={`${stage.status}-line`}
              aria-hidden="true"
              className="flex-1 basis-0 min-w-5 h-px mx-2 bg-border relative overflow-hidden"
            >
              <span
                className="absolute inset-y-0 left-0 bg-[#16a34a] transition-[width] duration-500"
                style={{ width: done ? "100%" : "0%" }}
              />
            </li>
          ) : null,
        ]
      })}
    </ol>
  )
}

function Timeline({
  order,
  status,
}: {
  order: OrderDetail
  status: string
}) {
  const stageIndex = PIPELINE.findIndex((s) => s.status === status)
  const settled = status === "COMPLETED" || status === "CANCELLED"

  return (
    <section className={CARD}>
      <header className="px-5 py-3.5 border-b border-border">
        <h2 className="text-sm font-semibold text-title">Timeline</h2>
      </header>

      <div className="px-5 py-4 space-y-4">
        <Moment
          label="Order placed"
          value={formatFull(order.createdAt)}
          date={order.createdAt}
        />
        <Moment
          label={settled ? "Closed" : "Last updated"}
          value={formatFull(order.updatedAt)}
          date={order.updatedAt}
        />

        <div className="flex items-center justify-between gap-3 pt-3.5 border-t border-border">
          <span className="text-xs text-soft">Stage</span>
          <span className="text-sm text-title">
            {status === "CANCELLED"
              ? "Cancelled"
              : `${stageIndex + 1} of ${PIPELINE.length} · ${STATUS_LABEL[status]}`}
          </span>
        </div>
      </div>
    </section>
  )
}

function Moment({
  label,
  value,
  date,
}: {
  label: string
  value: string
  date: Date | string
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-sm text-label">{label}</span>
      <span className="text-right">
        <span className="block text-sm text-title tabular-nums">{value}</span>
        <span className="block text-xs text-soft mt-0.5">
          <RelativeTime date={date} />
        </span>
      </span>
    </div>
  )
}

function Fact({
  icon: Icon,
  label,
  value,
  hint,
  tone = "plain",
}: {
  icon: typeof Bike
  label: string
  value: string
  hint?: string
  tone?: "plain" | "good" | "warn"
}) {
  const toneClass =
    tone === "good"
      ? "text-[#16a34a]"
      : tone === "warn"
        ? "text-[#ca8a04]"
        : "text-soft"

  return (
    <div className="bg-surface px-5 py-4 min-w-0">
      <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-soft">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </p>
      <p className="text-base font-semibold text-title mt-2 leading-none truncate">
        {value}
      </p>
      {hint && <p className={cn("text-xs mt-1.5 truncate", toneClass)}>{hint}</p>}
    </div>
  )
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center text-xs text-label bg-elevated border border-border rounded-md px-2 py-1">
      {children}
    </span>
  )
}

function Row({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone?: string
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-sm text-label">{label}</dt>
      <dd className={cn("text-sm tabular-nums", tone ?? "text-title")}>
        {value}
      </dd>
    </div>
  )
}

function RelativeTime({ date }: { date: Date | string }) {
  const [now, setNow] = useState<number | null>(null)

  useEffect(() => {
    const tick = () => setNow(Date.now())
    const raf = requestAnimationFrame(tick)
    const id = setInterval(tick, 30_000)
    return () => {
      cancelAnimationFrame(raf)
      clearInterval(id)
    }
  }, [])

  if (now === null) return null

  const minutes = Math.max(0, Math.floor((now - new Date(date).getTime()) / 60000))

  const text =
    minutes < 1
      ? "just now"
      : minutes < 60
        ? `${minutes}m ago`
        : minutes < 1440
          ? `${Math.floor(minutes / 60)}h ago`
          : `${Math.floor(minutes / 1440)}d ago`

  return (
    <span className="inline-flex items-center gap-1.5">
      <Clock className="w-3.5 h-3.5" />
      {text}
    </span>
  )
}

function money(value: number) {
  return `Rs. ${Math.round(value).toLocaleString("en-US")}`
}

function formatFull(date: Date | string) {
  return new Date(date).toLocaleString("en-US", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  })
}

function formatTime(date: Date | string) {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })
}

function formatDay(date: Date | string) {
  return new Date(date).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
  })
}

function titleCase(value: string) {
  return value.charAt(0) + value.slice(1).toLowerCase()
}
