import {
  HeaderSkeleton,
  MenuSkeleton,
  OverviewSkeleton,
} from "@/components/dashboard/overview/skeletons"

export default function DashboardLoading() {
  return (
    <div className="space-y-8 pb-4">
      <HeaderSkeleton />
      <OverviewSkeleton />
      <MenuSkeleton />
    </div>
  )
}
