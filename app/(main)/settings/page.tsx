import { getRestaurant } from "@/lib/actions/restaurant/settings";
import SettingsClient from "./settings-client";
import { redirect } from "next/navigation";

const page = async () => {
  const restaurant = await getRestaurant();
if (!restaurant) redirect("/dashboard")

  return <SettingsClient restaurant={restaurant} />;
};

export default page;
