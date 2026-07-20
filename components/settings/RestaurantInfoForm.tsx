"use client";

import { RestaurantSettingsType } from "@/app/(main)/settings/config";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldConfig } from "../shared/form/field-config.types";
import { FormRenderer } from "../shared/form/FormRenderer";
import { Control } from "react-hook-form";
import { Button } from "../ui/button";
import { ImageUploadField } from "../shared/image/image-upload-field";

// ----- Types ----------------------------

export type RestaurantBasicInfo = Pick<
  RestaurantSettingsType,
  "name" | "address" | "phone" | "city" | "logoUrl" | "coverImages" | "id"
>;

interface RestaurantInfoProps {
  restaurant: RestaurantBasicInfo;
}

// ----- Schema -----------------------------------

const restaurantInfoSchema = z.object({
  name: z.string(),
  address: z.string(),
  phone: z.string(),
  city: z.string(),
  logoUrl: z.string(),
  coverImages: z.array(z.string()),
});

type RestaurantInfoFormValues = z.infer<typeof restaurantInfoSchema>;

// ------ Config Start -------------------------

const restaurantSettingsFields: FieldConfig[] = [
  {
    name: "name",
    label: "Restaurnt Name",
    type: "text",
  },
  {
    name: "address",
    label: "Full Address",
    type: "text",
  },
  {
    name: "phone",
    label: "Phone Number",
    type: "text",
  },
  {
    name: "city",
    label: "City",
    type: "text",
  },
];

// ------ Config Eng -------------------------

const RestaurantInfoForm = ({ restaurant }: RestaurantInfoProps) => {
  const form = useForm<RestaurantInfoFormValues>({
    resolver: zodResolver(restaurantInfoSchema),
    defaultValues: {
      name: restaurant.name,
      address: restaurant.address || "",
      city: restaurant.address || "",
      phone: restaurant.phone,
      logoUrl: restaurant.logoUrl || "",
      coverImages: restaurant.coverImages.map((coverImage) => coverImage.url),
    },
  });

  function onSubmit(data: RestaurantInfoFormValues) {
    console.log("data", data);
  }

  return (
    <div>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-3">
          <FormRenderer
            fields={restaurantSettingsFields}
            control={form.control as Control<any>}
            className="grid grid-cols-3 gap-5"
          />

          {/* Logo — single image */}
          <ImageUploadField
            value={form.watch("logoUrl") ? [form.watch("logoUrl")] : []}
            multiple={false}
            onChange={(urls) => form.setValue("logoUrl", urls[0] ?? "")}
          />

          {/* Cover images — multiple */}
          <ImageUploadField
            value={form.watch("coverImages") ?? []}
            aspect="video"
            onChange={(urls) => form.setValue("coverImages", urls)}
          />
        </div>

        <Button type="submit" size="lg" variant="default" className="w-full mt-5">
          Create Settings
        </Button>
      </form>
    </div>
  );
};

export default RestaurantInfoForm;
