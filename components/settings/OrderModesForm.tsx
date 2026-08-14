"use client";

import { Control, useForm, useWatch } from "react-hook-form";
import { RestaurantSettingsType } from "@/app/(main)/settings/config";
import z from "zod";
import { FieldConfig } from "../shared/form/field-config.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormRenderer } from "../shared/form/FormRenderer";
import { SettingsSection } from "./SettingsSection";
import { SettingsSubmitButton } from "./SettingsSubmitButton";
import { updateOrderModes } from "@/lib/actions/restaurant/settings";
import { toast } from "sonner";

//  ----- Schema ----------------------

const orderModeSchema = z.object({
  dineIn: z.boolean(),
  takeaway: z.boolean(),
  delivery: z.boolean(),
  deliveryFee: z.number().optional(),
  minimumOrder: z.number().optional(),
  estimatedTime: z.number().optional(),
});

type orderModesFormValues = z.infer<typeof orderModeSchema>;

// ------ Form fields -----------------------
// Grouped rather than flat: the switches want a divided list and the
// numbers want a grid, and FormRenderer lays out one array with one
// className. Field order within each group matches the original array.

const channelFields: FieldConfig[] = [
  {
    name: "delivery",
    label: "Delivery",
    type: "switch",
    description: "Riders take orders out to the customer's address.",
  },
  {
    name: "dineIn",
    label: "Dine in",
    type: "switch",
    description: "Customers order for a table in your restaurant.",
  },
  {
    name: "takeaway",
    label: "Takeaway",
    type: "switch",
    description: "Customers order ahead and collect at the counter.",
  },
];

const orderRuleFields: FieldConfig[] = [
  {
    name: "minimumOrder",
    label: "Minimum order",
    type: "number",
    description: "Smallest basket total you will accept.",
  },
];

const deliveryRuleFields: FieldConfig[] = [
  {
    name: "deliveryFee",
    label: "Delivery fee",
    type: "number",
    description: "Flat charge added to delivery orders.",
  },
  {
    name: "estimatedTime",
    label: "Estimated time",
    type: "number",
    description: "Typical minutes from order to doorstep.",
  },
];

//  -----------------------------------------------------

const OrderModesForm = ({
  restaurant,
}: {
  restaurant: RestaurantSettingsType;
}) => {
  const form = useForm<orderModesFormValues>({
    resolver: zodResolver(orderModeSchema),
    defaultValues: {
      dineIn: restaurant.dineIn,
      takeaway: restaurant.takeaway,
      delivery: restaurant.delivery,
      minimumOrder: restaurant.minimumOrder,
      deliveryFee: restaurant.deliveryFee,
      estimatedTime: restaurant.estimatedTime,
    },
  });

  const values = useWatch({ control: form.control });
  const isDeliveryEnabled = values?.delivery ?? false;
  const enabledChannels = [
    values?.dineIn,
    values?.takeaway,
    values?.delivery,
  ].filter(Boolean).length;

  // Same rule as before: the delivery-only numbers drop out when delivery
  // is off, while the minimum order stays put.
  const visibleRuleFields = isDeliveryEnabled
    ? [...orderRuleFields, ...deliveryRuleFields]
    : orderRuleFields;

  async function onSubmit(data: orderModesFormValues) {
    try {
      const response = await updateOrderModes(data);

      if (response?.success) {
        toast.success(response.message ?? "Order modes updated successfully.");
        // update the form state to match the saved values
        form.reset(data);
      } else {
        toast.error(response?.message ?? "Failed to update ordermodes.");
      }
    } catch (error) {
      // log and show a generic error message for unexpected failures
      console.error("Failed to update order modes", error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  }

  const control = form.control as Control<any>;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      <SettingsSection
        title="Order channels"
        description="The ways customers can order from you."
        contentClassName="px-5"
        action={
          <span className="text-xs text-label tabular-nums">
            <span className="font-semibold text-title">{enabledChannels}</span>{" "}
            of 3 active
          </span>
        }
      >
        {/* Row treatment comes from the wrapper — FormRenderer emits one
            [data-slot=field] per entry, so dividers and padding are applied
            without the renderer needing to know about them. */}
        <FormRenderer
          fields={channelFields}
          control={control}
          className="divide-y divide-border [&>[data-slot=field]]:py-4"
        />
      </SettingsSection>

      {enabledChannels === 0 && (
        <p className="text-xs text-[#dc2626] bg-[#fef2f2] border border-[#fecaca] rounded-lg px-3.5 py-2.5">
          Every channel is off — your storefront has no way for customers to
          order.
        </p>
      )}

      <SettingsSection
        title={isDeliveryEnabled ? "Order & delivery rules" : "Order rules"}
        description={
          isDeliveryEnabled
            ? "Thresholds and charges applied at checkout."
            : "Turn delivery on to set a delivery fee and estimated time."
        }
        contentClassName="p-5"
      >
        <FormRenderer
          fields={visibleRuleFields}
          control={control}
          className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
        />
      </SettingsSection>

      <SettingsSubmitButton
        label="Save order modes"
        isSubmitting={form.formState.isSubmitting}
      />
    </form>
  );
};

export default OrderModesForm;
