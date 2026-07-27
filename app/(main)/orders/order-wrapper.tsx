import React from "react";
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

export default OrderWrapper;
