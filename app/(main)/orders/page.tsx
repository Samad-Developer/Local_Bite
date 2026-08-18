import { Suspense } from "react";
import { getOrders } from "@/lib/actions/orders/orders";
import OrdersRealtime from "./order-client";
import { OrdersSkeleton } from "./orders-skeleton";

const OrderWrapper = async () => {
  const orders = await getOrders({});

  const serializedOrders = orders.map((order) => ({
    ...order,
    createdAt: order.createdAt.toISOString(),
  }));

  return <OrdersRealtime initialOrders={serializedOrders} />;
};

export default async function OrdersPage() {
  return (
    <Suspense fallback={<OrdersSkeleton />}>
      <OrderWrapper />
    </Suspense>
  );
}
