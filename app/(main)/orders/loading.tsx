import { Skeleton } from "@/components/ui/skeleton"

export default function OrdersLoading() {
  return (
    <div className="space-y-6">

      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-8 w-32 bg-[#f3f4f6]" />
      </div>

      {/* Filter tabs skeleton */}
      <div className="flex gap-2 border-b border-[#e5e7eb] pb-0">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20 bg-[#f3f4f6]" />
        ))}
      </div>

      {/* Search skeleton */}
      <Skeleton className="h-10 w-64 bg-[#f3f4f6]" />

      {/* Table skeleton */}
      <div className="bg-white border border-[#e5e7eb] rounded-xl overflow-hidden">
        <div className="bg-[#f9fafb] border-b border-[#e5e7eb] px-4 py-3 flex gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-3 w-16 bg-[#f3f4f6]" />
          ))}
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="px-4 py-4 border-b border-[#f3f4f6] flex gap-4 items-center">
            <Skeleton className="h-4 w-12 bg-[#f3f4f6]" />
            <Skeleton className="h-4 w-28 bg-[#f3f4f6]" />
            <Skeleton className="h-4 w-16 bg-[#f3f4f6]" />
            <Skeleton className="h-4 w-12 bg-[#f3f4f6]" />
            <Skeleton className="h-4 w-20 bg-[#f3f4f6]" />
            <Skeleton className="h-4 w-16 bg-[#f3f4f6]" />
            <Skeleton className="h-6 w-20 rounded-full bg-[#f3f4f6]" />
            <Skeleton className="h-4 w-12 bg-[#f3f4f6]" />
            <Skeleton className="h-8 w-16 bg-[#f3f4f6]" />
          </div>
        ))}
      </div>

    </div>
  )
}