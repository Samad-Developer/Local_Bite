"use client";
import { RestaurantSettingsType } from "@/app/(main)/settings/config";
import z from "zod";
import { FieldConfig } from "../shared/form/field-config.types";
import { Control, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormRenderer } from "../shared/form/FormRenderer";
import { SettingsSection } from "./SettingsSection";
import { SettingsSubmitButton } from "./SettingsSubmitButton";
import { toast } from "sonner";
import { updatePaymentModes } from "@/lib/actions/restaurant/settings";

const paymentModeSchema = z.object({
  acceptsCash: z.boolean(),
  acceptsCard: z.boolean(),
  acceptsOnline: z.boolean(),
});

type paymentModesFormValues = z.infer<typeof paymentModeSchema>;

const paymentModesFormFields: FieldConfig[] = [
  {
    name: "acceptsCash",
    label: "Cash on delivery",
    type: "switch",
    description: "Customers pay the rider or at the counter when they collect.",
  },
  {
    name: "acceptsCard",
    label: "Card",
    type: "switch",
    description: "Card payment taken on the machine at handover.",
  },
  {
    name: "acceptsOnline",
    label: "Online bank transfer",
    type: "switch",
    description: "Customers transfer the total before the order is confirmed.",
  },
];

const PaymentModesForm = ({
  restaurant,
}: {
  restaurant: RestaurantSettingsType;
}) => {
  const form = useForm<paymentModesFormValues>({
    resolver: zodResolver(paymentModeSchema),
    defaultValues: {
      acceptsCard: restaurant.acceptsCard,
      acceptsCash: restaurant.acceptsCash,
      acceptsOnline: restaurant.acceptsOnline,
    },
  });

  async function onSubmit(data: paymentModesFormValues) {
    try {
      const response = await updatePaymentModes(data);

      if (response?.success) {
        toast.success(response.message ?? "Order modes updated successfully.");
        form.reset(data);
      } else {
        toast.error(response?.message ?? "Failed to update ordermodes.");
      }
    } catch (error) {
      console.error("Failed to update order modes", error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  }

  const values = form.watch();
  const enabledCount = [
    values.acceptsCash,
    values.acceptsCard,
    values.acceptsOnline,
  ].filter(Boolean).length;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      <SettingsSection
        title="Payment methods"
        description="Published to your storefront so customers know how they can pay."
        contentClassName="px-5"
        action={
          <span className="text-xs text-label tabular-nums">
            <span className="font-semibold text-title">{enabledCount}</span> of 3
            enabled
          </span>
        }
      >
        <FormRenderer
          fields={paymentModesFormFields}
          control={form.control as Control<any>}
          className="divide-y divide-border [&>[data-slot=field]]:py-4"
        />
      </SettingsSection>

      {enabledCount === 0 && (
        <p className="text-xs text-[#dc2626] bg-[#fef2f2] border border-[#fecaca] rounded-lg px-3.5 py-2.5">
          All three are switched off — your storefront has no payment option to
          show customers.
        </p>
      )}

      <SettingsSubmitButton
        label="Save payment modes"
        isSubmitting={form.formState.isSubmitting}
      />
    </form>
  );
};

export default PaymentModesForm;
