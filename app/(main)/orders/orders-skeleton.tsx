import { Skeleton } from "@/components/ui/skeleton"

export function OrdersSkeleton() {
  return (
    <div className="space-y-4">

      <div className="flex items-center justify-between gap-6">
        <Skeleton className="h-7 w-40 bg-[#f3f4f6]" />
        <Skeleton className="h-3 w-48 bg-[#f3f4f6]" />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Skeleton className="h-10 w-full max-w-sm bg-[#f3f4f6]" />
        <div className="ml-auto flex flex-wrap gap-1.5">
          {[64, 76, 96, 92, 80, 96, 92].map((w, i) => (
            <Skeleton
              key={i}
              className="h-8 rounded-full bg-[#f3f4f6]"
              style={{ width: w }}
            />
          ))}
        </div>
      </div>

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
