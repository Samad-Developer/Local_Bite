"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/supabaseClient";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { playOrderAlert, unlockOrderAlert } from "@/lib/utils/sound";

type NewOrderData = {
  id: string;
  orderNumber: number;
  customerName: string;
  total: number;
} | null;

type OrderChangeEvent = {
  eventType: "INSERT" | "UPDATE" | "DELETE";
  order: any;
} | null;

type NotificationContextType = {
  activeOrder: NewOrderData;
  dismissBuzzer: () => void;
  lastOrderChange: OrderChangeEvent; 
  clearLastOrderChange: () => void;
};

const NotificationContext = createContext<NotificationContextType | null>(null);

export function useOrderNotification() {
  const ctx = useContext(NotificationContext);
  if (!ctx)
    throw new Error("useOrderNotification must be used inside provider");
  return ctx;
}

export function OrderNotificationProvider({
  restaurantId,
  children,
}: {
  restaurantId: string;
  children: React.ReactNode;
}) {
  const [activeOrder, setActiveOrder] = useState<NewOrderData>(null);
  const [lastOrderChange, setLastOrderChange] =
    useState<OrderChangeEvent>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    }
  }, []);

  useEffect(() => {
    function unlock() {
      unlockOrderAlert();
    }

    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });

    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("global-order-notifications")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        (payload: RealtimePostgresChangesPayload<any>) => {
          const eventType = payload.eventType;
          const order = (payload.new ?? payload.old) as any;

          if (order.restaurantId !== restaurantId) return;

          setLastOrderChange({ eventType, order: payload.new ?? payload.old });

          if (eventType === "INSERT") {

            playOrderAlert();

            if (typeof window !== "undefined" && "Notification" in window) {
              if (Notification.permission === "granted") {
                const notif = new Notification(
                  `New Order #${order.orderNumber}`,
                  {
                    body: `From ${order.customerName} — Rs. ${order.total}`,
                    icon: "/icons/order-icon.png",
                    tag: order.id,
                  },
                );
                notif.onclick = () => {
                  window.focus();
                  window.location.href = `/orders/${order.id}`;
                };
              }
            }

            setActiveOrder({
              id: order.id,
              orderNumber: order.orderNumber,
              customerName: order.customerName,
              total: order.total,
            });
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [restaurantId]);

  function dismissBuzzer() {
    setActiveOrder(null);
  }

  function clearLastOrderChange() {
    setLastOrderChange(null);
  }

  return (
    <NotificationContext
      value={{
        activeOrder,
        dismissBuzzer,
        lastOrderChange,
        clearLastOrderChange,
      }}
    >
      {children}
    </NotificationContext>
  );
}
