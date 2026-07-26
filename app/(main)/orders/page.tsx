import { getOrders } from "@/lib/actions/orders/orders"
import { auth } from "@/auth"
import OrdersRealtime from "./order-client"

export default async function OrdersPage() {
  const session = await auth()

  const orders = await getOrders({})

  // Prisma Date objects ko string mein convert karo
  // taake realtime data (Supabase se string aata hai) ke sath type match ho
  const serializedOrders = orders.map((order) => ({
    ...order,
    createdAt: order.createdAt.toISOString(),
  }))

  return (
    <OrdersRealtime
      initialOrders={serializedOrders}
    />
  )
}