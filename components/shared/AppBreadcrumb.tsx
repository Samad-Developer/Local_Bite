import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Fragment } from "react"

interface BreadcrumbItem {
  label: string
  href?: string
}

interface AppBreadcrumbProps {
  items: BreadcrumbItem[]
}

export default function AppBreadcrumb({ items }: AppBreadcrumbProps) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((item, index) => {
          const isLast = index === items.length - 1

          return (
            <Fragment key={item.label}>

              <BreadcrumbItem>
                {isLast || !item.href ? (
                  <BreadcrumbPage className="text-[#111111] font-medium text-sm">
                    {item.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    href={item.href}
                    className="text-[#6b7280] hover:text-[#111111] text-sm transition-colors"
                  >
                    {item.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>

              {!isLast && (
                <BreadcrumbSeparator className="" />
              )}

            </Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
