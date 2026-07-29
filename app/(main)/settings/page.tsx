import { Suspense } from "react";
import { getRestaurant } from "@/lib/actions/restaurant/settings";
import SettingsClient from "./settings-client";
import { redirect } from "next/navigation";

async function SettingsData() {
  const restaurant = await getRestaurant();
  if (!restaurant) redirect("/dashboard");

  return <SettingsClient restaurant={restaurant} />;
}

export default function Page() {
  return (
    <Suspense fallback={<SettingsSkeleton />}>
      <SettingsData />
    </Suspense>
  );
}

function SettingsSkeleton() {
  return <div className="p-6">Loading settings...</div>;
}