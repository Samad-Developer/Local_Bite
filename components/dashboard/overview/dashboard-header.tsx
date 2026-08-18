import Image from "next/image"
import Link from "next/link"
import type { Route } from "next"
import { ChefHat } from "lucide-react"
import { cn } from "@/lib/utils"
import { getRestaurant } from "@/lib/actions/restaurant/settings"
import RangeTabs from "./range-tabs"
import type { RangeKey } from "@/types/dashboard.types"

const DAY_NAMES = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
]

export default async function DashboardHeader({
  range,
  rangeLabel,
}: {
  range: RangeKey
  rangeLabel: string
}) {
  const restaurant = await getRestaurant()

  const todayIndex = (new Date().getDay() + 6) % 7
  const today = restaurant?.operatingHours.find((h) => h.day === todayIndex)

  const channels = [
    { label: "Dine in", enabled: restaurant?.dineIn ?? false },
    { label: "Takeaway", enabled: restaurant?.takeaway ?? false },
    { label: "Delivery", enabled: restaurant?.delivery ?? false },
  ]

  const isOpen = restaurant?.isOpen ?? false

  const hours = today?.isOpen
    ? `${today.openTime} – ${today.closeTime}`
    : "Closed today"

  return (
    <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between border-b border-border pb-5">
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="w-11 h-11 rounded-lg overflow-hidden border border-border bg-elevated flex items-center justify-center shrink-0">
          {restaurant?.logoUrl ? (
            <Image
              src={restaurant.logoUrl}
              alt={restaurant.name}
              width={44}
              height={44}
              className="w-full h-full object-cover"
            />
          ) : (
            <ChefHat className="w-5 h-5 text-soft" strokeWidth={1.5} />
          )}
        </div>

        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-title leading-none">
            Dashboard
          </h1>

          <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-xs text-soft mt-2">
            <span className="text-label font-medium">
              {restaurant?.name ?? "Your restaurant"}
            </span>

            {restaurant?.city && (
              <>
                <Dot />
                <span>{restaurant.city}</span>
              </>
            )}

            <Dot />
            <span
              className={cn(
                "inline-flex items-center gap-1.5 font-medium",
                isOpen ? "text-[#16a34a]" : "text-[#dc2626]",
              )}
            >
              <span
                className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  isOpen ? "bg-[#16a34a]" : "bg-[#dc2626]",
                )}
              />
              {isOpen ? "Accepting orders" : "Closed"}
            </span>

            <Dot />
            <span>
              {DAY_NAMES[todayIndex]} {hours}
            </span>

            <Dot />
            <span className="inline-flex items-center gap-1.5">
              {channels.map((channel) => (
                <span
                  key={channel.label}
                  className={cn(
                    channel.enabled
                      ? "text-label"
                      : "text-[#9ca3af] line-through",
                  )}
                >
                  {channel.label}
                </span>
              ))}
            </span>

            <Link
              href={"/settings" as Route}
              prefetch={false}
              className="text-soft hover:text-brand transition-colors duration-150 underline underline-offset-2 decoration-transparent hover:decoration-current"
            >
              Edit
            </Link>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <span className="hidden sm:inline text-xs text-soft">{rangeLabel}</span>
        <RangeTabs value={range} />
      </div>
    </header>
  )
}

function Dot() {
  return <span className="text-[#9ca3af]">·</span>
}
