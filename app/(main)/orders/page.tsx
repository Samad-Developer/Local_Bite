import PageHeader from "@/components/shared/PageHeader";
import { Suspense } from "react";
import { getOrders } from "@/lib/actions/orders/orders";
import OrdersRealtime from "./order-client";

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
    <>
      <PageHeader
        title="Realtime Orders"
        buttonLabel=""
        onButtonClick={() => {}}
        isAddNewButtonVisible={false}
      />

      <Suspense fallback={<h1>loading...</h1>}>
        <OrderWrapper />
      </Suspense>
    </>
  );
}
