import { Suspense } from "react"
import { getDeliveryAreas } from "@/lib/actions/areas/areas"
import DeliveryAreasClient from "./delivery-areas-client"
import { Skeleton } from "@/components/ui/skeleton"

async function DeliveryAreasData() {
  const areas = await getDeliveryAreas()
  return <DeliveryAreasClient areas={areas} />
}

function DeliveryAreasLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-8 w-40 bg-[#f3f4f6]" />
        <Skeleton className="h-10 w-32 bg-[#f3f4f6]" />
      </div>
      <div className="bg-white border border-[#e5e7eb] rounded-xl overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="px-6 py-4 border-b border-[#f3f4f6] flex gap-4 items-center">
            <Skeleton className="h-7 w-7 rounded-lg bg-[#f3f4f6]" />
            <Skeleton className="h-4 w-32 bg-[#f3f4f6]" />
            <Skeleton className="h-4 w-24 bg-[#f3f4f6]" />
            <Skeleton className="h-4 w-24 bg-[#f3f4f6]" />
            <Skeleton className="h-6 w-16 rounded-full bg-[#f3f4f6]" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function DeliveryAreasPage() {
  return (
    <Suspense fallback={<DeliveryAreasLoading />}>
      <DeliveryAreasData />
    </Suspense>
  )
}