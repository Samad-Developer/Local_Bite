import Link from "next/link"
import type { Route } from "next"
import { Stethoscope } from "lucide-react"
import { cn } from "@/lib/utils"
import { CardHeading, CardLink, DashCard, MicroLabel } from "./ui"
import { formatNumber } from "@/lib/utils/format"
import type { MenuPerformance } from "@/types/dashboard.types"

export default function MenuHealth({ data }: { data: MenuPerformance }) {
  const tiles = [
    {
      label: "Live items",
      value: formatNumber(data.availableItems),
      tone: "text-title",
    },
    {
      label: "Off menu",
      value: formatNumber(data.unavailableItems),
      tone: data.unavailableItems > 0 ? "text-[#dc2626]" : "text-title",
    },
    {
      label: "No sales",
      value: formatNumber(data.noSaleItems),
      tone: data.noSaleItems > 0 ? "text-[#ca8a04]" : "text-title",
    },
    {
      label: "Active offers",
      value: formatNumber(data.activeDiscounts),
      tone: data.activeDiscounts > 0 ? "text-brand" : "text-title",
    },
  ]

  const hasLists =
    data.unavailableList.length > 0 || data.noSaleList.length > 0

  return (
    <DashCard className="flex flex-col">
      <CardHeading
        icon={Stethoscope}
        title="Menu health"
        subtitle={`${formatNumber(data.totalItems)} items across your menu`}
        action={<CardLink href={"/menu/items" as Route}>Fix items</CardLink>}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4">
        {tiles.map((tile, i) => (
          <div
            key={tile.label}
            className={cn(
              "px-5 py-4",
              i % 2 === 1 && "border-l",
              i >= 2 && "border-t sm:border-t-0",
              i > 0 && "sm:border-l",
            )}
          >
            <p className={`text-2xl font-semibold tabular-nums leading-none ${tile.tone}`}>
              {tile.value}
            </p>
            <p className="text-xs text-soft mt-2">{tile.label}</p>
          </div>
        ))}
      </div>

      {hasLists && (
        <div className="flex flex-col sm:flex-row border-t border-border [&>*]:flex-1 [&>*+*]:border-t [&>*+*]:sm:border-t-0 [&>*+*]:sm:border-l">
          {data.unavailableList.length > 0 && (
            <ItemList
              title="Currently off menu"
              hint="Turn these back on when stock returns"
              items={data.unavailableList}
              dot="bg-[#dc2626]"
              total={data.unavailableItems}
            />
          )}

          {data.noSaleList.length > 0 && (
            <ItemList
              title="No sales this period"
              hint="Consider a photo, price or promo refresh"
              items={data.noSaleList}
              dot="bg-[#ca8a04]"
              total={data.noSaleItems}
            />
          )}
        </div>
      )}

      {data.hiddenCategories > 0 && (
        <p className="text-xs text-label bg-elevated border-t border-border px-5 py-3">
          {data.hiddenCategories}{" "}
          {data.hiddenCategories === 1 ? "category is" : "categories are"} hidden
          from customers — items inside them cannot be ordered.
        </p>
      )}
    </DashCard>
  )
}

function ItemList({
  title,
  hint,
  items,
  dot,
  total,
}: {
  title: string
  hint: string
  items: { id: string; name: string; category: string }[]
  dot: string
  total: number
}) {
  return (
    <div className="px-5 py-4">
      <MicroLabel>{title}</MicroLabel>
      <p className="text-xs text-soft mt-1 mb-3.5">{hint}</p>

      <ul className="space-y-2.5">
        {items.map((item) => (
          <li key={item.id} className="flex items-center gap-2.5">
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />
            <Link
              href={`/menu/items/${item.id}/edit` as Route}
              prefetch={false}
              className="text-sm text-title truncate hover:text-brand transition-colors duration-150"
            >
              {item.name}
            </Link>
            <span className="text-xs text-soft ml-auto shrink-0 truncate max-w-[45%]">
              {item.category}
            </span>
          </li>
        ))}
      </ul>

      {total > items.length && (
        <p className="text-xs text-soft mt-3.5">+ {total - items.length} more</p>
      )}
    </div>
  )
}
