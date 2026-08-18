"use client"

import { useState } from "react"
import PageHeader from "@/components/shared/PageHeader"
import RestaurantInfoForm from "@/components/settings/RestaurantInfoForm"
import OperatingHoursForm from "@/components/settings/OperatingHoursForm"
import OrderModesForm from "@/components/settings/OrderModesForm"
import PaymentModesForm from "@/components/settings/PaymentModesForm"
import type { RestaurantSettingsType } from "./config"

const tabs = [
  { id: "info",     label: "Restaurant Info" },
  { id: "hours",    label: "Operating Hours" },
  { id: "orders",   label: "Order Modes" },
  { id: "payments", label: "Payment Modes" },
]

export default function SettingsClient({
  restaurant,
}: {
  restaurant: RestaurantSettingsType
}) {
  const [activeTab, setActiveTab] = useState("info")

  return (
    <div className="space-y-6">

      <PageHeader
        title="Settings"
        buttonLabel=""
        isAddNewButtonVisible={false}
        onButtonClick={() => {}}
      />

      <div className="flex gap-2 border-b border-[#e5e7eb] pb-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              px-4 py-2.5 text-sm font-medium border-b-2 transition-colors
              ${activeTab === tab.id
                ? "border-[#f97316] text-[#f97316]"
                : "border-transparent text-[#6b7280] hover:text-[#111111]"
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div>
        {activeTab === "info" && (
          <RestaurantInfoForm restaurant={restaurant} />
        )}
        {activeTab === "hours" && (
          <OperatingHoursForm
            operatingHours={restaurant?.operatingHours}
          />
        )}
        {activeTab === "orders" && (
          <OrderModesForm restaurant={restaurant} />
        )}
        {activeTab === "payments" && (
          <PaymentModesForm restaurant={restaurant} />
        )}
      </div>

    </div>
  )
}
