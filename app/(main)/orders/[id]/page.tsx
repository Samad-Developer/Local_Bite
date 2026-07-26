import { getOrderById } from "@/lib/actions/orders/orders"
import { notFound } from "next/navigation"
import OrderDetailClient from "./order-detail-client"

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const order = await getOrderById(id)

  if (!order) notFound()

  return <OrderDetailClient order={order} />
}