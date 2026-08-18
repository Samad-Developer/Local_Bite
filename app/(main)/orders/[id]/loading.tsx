import { Skeleton } from "@/components/ui/skeleton"

const BLOCK = "bg-[#f1f2f4]"
const CARD = "bg-surface border border-border rounded-xl"

export default function Loading() {
  return (
    <div className="max-w-5xl space-y-6 pb-8">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Skeleton className={`w-9 h-9 rounded-lg ${BLOCK}`} />
          <div className="space-y-2.5">
            <Skeleton className={`h-6 w-52 ${BLOCK}`} />
            <Skeleton className={`h-3 w-64 ${BLOCK}`} />
          </div>
        </div>
        <div className="space-y-2.5 flex flex-col items-end">
          <Skeleton className={`h-6 w-32 ${BLOCK}`} />
          <Skeleton className={`h-3 w-40 ${BLOCK}`} />
        </div>
      </div>

      <div className={`${CARD} flex items-center gap-6 px-5 py-4`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2.5 flex-1">
            <Skeleton className={`w-8 h-8 rounded-full shrink-0 ${BLOCK}`} />
            <Skeleton className={`h-3 w-16 ${BLOCK}`} />
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className={CARD}>
            <div className="px-5 py-3.5 border-b border-border">
              <Skeleton className={`h-4 w-20 ${BLOCK}`} />
            </div>
            <div className="divide-y divide-border">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3.5 px-5 py-4">
                  <Skeleton className={`w-12 h-12 rounded-lg shrink-0 ${BLOCK}`} />
                  <div className="flex-1 space-y-2">
                    <Skeleton className={`h-4 w-40 ${BLOCK}`} />
                    <Skeleton className={`h-3 w-24 ${BLOCK}`} />
                  </div>
                  <Skeleton className={`h-4 w-16 ${BLOCK}`} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className={`${CARD} p-5 space-y-3`}>
            <Skeleton className={`h-11 w-full rounded-lg ${BLOCK}`} />
            <Skeleton className={`h-9 w-full rounded-lg ${BLOCK}`} />
          </div>

          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className={CARD}>
              <div className="px-5 py-3.5 border-b border-border">
                <Skeleton className={`h-4 w-24 ${BLOCK}`} />
              </div>
              <div className="px-5 py-4 space-y-3">
                <Skeleton className={`h-3.5 w-full ${BLOCK}`} />
                <Skeleton className={`h-3.5 w-4/5 ${BLOCK}`} />
                <Skeleton className={`h-3.5 w-3/5 ${BLOCK}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
