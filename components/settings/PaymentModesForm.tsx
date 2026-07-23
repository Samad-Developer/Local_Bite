"use client";
import { RestaurantSettingsType } from "@/app/(main)/settings/config";
import z from "zod";
import { FieldConfig } from "../shared/form/field-config.types";
import { Control, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormRenderer } from "../shared/form/FormRenderer";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";
import { toast } from "sonner";
import { updatePaymentModes } from "@/lib/actions/restaurant/settings";

//  ----- Schema ----------------------

const paymentModeSchema = z.object({
  acceptsCash: z.boolean(),
  acceptsCard: z.boolean(),
  acceptsOnline: z.boolean(),
});

type paymentModesFormValues = z.infer<typeof paymentModeSchema>;

// ------ Form fields -----------------------

const paymentModesFormFields: FieldConfig[] = [
  {
    name: "acceptsCash",
    label: "Accept Cash",
    type: "switch",
    description: "Enable if you want COD on your Website",
  },
  {
    name: "acceptsCard",
    label: "Accept Card",
    type: "switch",
    description: "Enable If you want CARD pyment",
  },
  {
    name: "acceptsOnline",
    label: "Accept Online Bank Transfer",
    type: "switch",
    description: "Enable if you want online pyment transfer",
  },
];

//  -----------------------------------------------------

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

  return (
    <div>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormRenderer
          fields={paymentModesFormFields}
          control={form.control as Control<any>}
          className="grid grid-cols-3"
        />

        <Button
          type="submit"
          size="lg"
          variant="default"
          className="w-full mt-5"
        >
          {form.formState.isSubmitting && <Spinner />}
          {form.formState.isSubmitting ? "Updating..." : "Update Payment Mode"}
        </Button>
      </form>
    </div>
  );
};

export default PaymentModesForm;
