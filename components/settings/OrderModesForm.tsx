"use client";

import { Control, useForm, useWatch } from "react-hook-form";
import { RestaurantSettingsType } from "@/app/(main)/settings/config";
import z from "zod";
import { FieldConfig } from "../shared/form/field-config.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormRenderer } from "../shared/form/FormRenderer";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";
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

const orderModesFormFields: FieldConfig[] = [
  {
    name: "delivery",
    label: "Delivery",
    type: "switch",
    description: "When you on it delivery will be availbe on your webiste",
  },
  {
    name: "dineIn",
    label: "Dine In",
    type: "switch",
    description: "When you on it dineIn will be availbe on your webiste",
  },
  {
    name: "takeaway",
    label: "Take Away",
    type: "switch",
    description: "When you on it take away will be availbe on your webiste",
  },
  {
    name: "minimumOrder",
    label: "Minimum Order",
    type: "number",
  },
  {
    name: "deliveryFee",
    label: "Delivery Fee",
    type: "number",
  },
  {
    name: "estimatedTime",
    label: "Estimated Time",
    type: "number",
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

  const isDeliveryEnabled = useWatch({
    control: form.control,
    name: "delivery",
  });

  const visibleFields = orderModesFormFields.filter(
    (field) =>
      isDeliveryEnabled ||
      !["deliveryFee", "estimatedTime"].includes(field.name),
  );

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
      // eslint-disable-next-line no-console
      console.error("Failed to update order modes", error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  }

  return (
    <div>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormRenderer
          fields={visibleFields}
          control={form.control as Control<any>}
          className="grid grid-cols-3 gap-5"
        />

        <Button
          type="submit"
          size="lg"
          variant="default"
          className="w-full mt-5"
        >
          {form.formState.isSubmitting && <Spinner />}
          {form.formState.isSubmitting ? "Updating..." : "Update Order Mode"}
        </Button>
      </form>
    </div>
  );
};

export default OrderModesForm;
