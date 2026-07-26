"use client";

import { createContext, useContext, useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase/supabaseClient";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

type NewOrderData = {
  id: string;
  orderNumber: number;
  customerName: string;
  total: number;
} | null;

// Poora change event — INSERT/UPDATE/DELETE teeno ke liye
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
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    }
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("global-order-notifications")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" }, // 👈 "*" — sab events sunega
        (payload: RealtimePostgresChangesPayload<any>) => {
          const eventType = payload.eventType;
          const order = (payload.new ?? payload.old) as any;

          if (order.restaurantId !== restaurantId) return;

          // Har change ko context mein bhej do — order-client isko use karega
          setLastOrderChange({ eventType, order: payload.new ?? payload.old });

          // Sirf INSERT par hi buzzer/sound/notification chalega
          if (eventType === "INSERT") {
            
            try {
              if (!audioRef.current) {
                audioRef.current = new Audio("/sounds/order-alert.mp3");
              }
              audioRef.current.currentTime = 0;
              audioRef.current.play();
            } catch (e) {}

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
    <NotificationContext.Provider
      value={{
        activeOrder,
        dismissBuzzer,
        lastOrderChange,
        clearLastOrderChange,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
