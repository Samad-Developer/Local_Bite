import { Skeleton } from "@/components/ui/skeleton"
import { DashCard } from "./ui"

const BLOCK = "bg-[#f1f2f4]"

export function HeaderSkeleton() {
  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between border-b border-border pb-5">
      <div className="flex items-center gap-3.5">
        <Skeleton className={`w-11 h-11 rounded-lg ${BLOCK}`} />
        <div className="space-y-2.5">
          <Skeleton className={`h-6 w-36 ${BLOCK}`} />
          <Skeleton className={`h-3 w-72 ${BLOCK}`} />
        </div>
      </div>
      <Skeleton className={`h-9 w-[264px] rounded-lg ${BLOCK}`} />
    </div>
  )
}

export function OverviewSkeleton() {
  return (
    <div className="space-y-8">
      {/* KPI strip */}
      <div className="border-y border-border">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="px-5 py-5 space-y-3">
              <Skeleton className={`h-3 w-24 ${BLOCK}`} />
              <Skeleton className={`h-7 w-32 ${BLOCK}`} />
              <Skeleton className={`h-3 w-20 ${BLOCK}`} />
              <Skeleton className={`h-6 w-full ${BLOCK}`} />
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-x-2 gap-y-1 py-3 border-t border-border">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2.5 px-2.5 py-2">
              <Skeleton className={`w-7 h-7 rounded-md ${BLOCK}`} />
              <div className="space-y-1.5">
                <Skeleton className={`h-2.5 w-20 ${BLOCK}`} />
                <Skeleton className={`h-3.5 w-14 ${BLOCK}`} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sales */}
      <SectionSkeleton>
        <div className="grid gap-5 xl:grid-cols-3">
          <ChartSkeleton className="xl:col-span-2" height={340} />
          <ChartSkeleton height={340} />
        </div>
        <div className="grid gap-5 xl:grid-cols-3">
          <ChartSkeleton className="xl:col-span-2" height={300} />
          <ChartSkeleton height={300} />
        </div>
      </SectionSkeleton>

      {/* Customers */}
      <SectionSkeleton>
        <div className="grid gap-5 xl:grid-cols-2">
          <ChartSkeleton height={320} />
          <ChartSkeleton height={320} />
        </div>
      </SectionSkeleton>
    </div>
  )
}

export function MenuSkeleton() {
  return (
    <SectionSkeleton>
      <div className="grid gap-5 xl:grid-cols-2">
        <ChartSkeleton height={380} />
        <ChartSkeleton height={380} />
      </div>
      <ChartSkeleton height={220} />
    </SectionSkeleton>
  )
}

export function SectionSkeleton({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <Skeleton className={`h-3 w-16 ${BLOCK}`} />
      <div className="space-y-5">{children}</div>
    </div>
  )
}

export function ChartSkeleton({
  className,
  height = 320,
}: {
  className?: string
  height?: number
}) {
  return (
    <DashCard className={className}>
      <div className="px-5 py-4 border-b border-border space-y-2">
        <Skeleton className={`h-4 w-40 ${BLOCK}`} />
        <Skeleton className={`h-3 w-56 ${BLOCK}`} />
      </div>
      <div className="p-5">
        <Skeleton className={`w-full ${BLOCK}`} style={{ height }} />
      </div>
    </DashCard>
  )
}
