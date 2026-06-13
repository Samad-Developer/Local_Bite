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
  href?: string  // if no href → renders as current page (not clickable)
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
                  // last item or no href → current page (not clickable)
                  <BreadcrumbPage className="text-[#111111] font-medium text-sm">
                    {item.label}
                  </BreadcrumbPage>
                ) : (
                  // has href → clickable link
                  <BreadcrumbLink
                    href={item.href}
                    className="text-[#6b7280] hover:text-[#111111] text-sm transition-colors"
                  >
                    {item.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>

              {/* separator between items — not after last */}
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