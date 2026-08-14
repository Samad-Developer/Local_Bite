"use client";

import { RestaurantSettingsType } from "@/app/(main)/settings/config";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldConfig } from "../shared/form/field-config.types";
import { FormRenderer } from "../shared/form/FormRenderer";
import { Control } from "react-hook-form";
import { ImageUploadField } from "../shared/image/image-upload-field";
import { toast } from "sonner";
import { SettingsSection } from "./SettingsSection";
import { SettingsSubmitButton } from "./SettingsSubmitButton";
import { updateSettings } from "@/lib/actions/restaurant/settings";

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
// Split into rows rather than one flat array: FormRenderer lays its fields
// out with a single className, so separate calls are how each row gets its
// own column count without the renderer needing to know about spans.

const identityFields: FieldConfig[] = [
  {
    name: "name",
    label: "Restaurant name",
    type: "text",
    placeholder: "e.g. Spice Garden",
    description: "Shown to customers across your storefront and receipts.",
  },
];

const contactFields: FieldConfig[] = [
  {
    name: "phone",
    label: "Phone number",
    type: "text",
    placeholder: "e.g. 0300 1234567",
    description: "Customers call this number about their orders.",
  },
  {
    name: "city",
    label: "City",
    type: "text",
    placeholder: "e.g. Karachi",
  },
];

const addressFields: FieldConfig[] = [
  {
    name: "address",
    label: "Full address",
    type: "text",
    placeholder: "Street, area and any landmark",
    description: "Used for pickup directions and delivery rider handoff.",
  },
];

// ------ Config End -------------------------

const RestaurantInfoForm = ({ restaurant }: RestaurantInfoProps) => {
  const form = useForm<RestaurantInfoFormValues>({
    resolver: zodResolver(restaurantInfoSchema),
    defaultValues: {
      name: restaurant.name,
      address: restaurant.address || "",
      city: restaurant.city || "",
      phone: restaurant.phone,
      logoUrl: restaurant.logoUrl || "",
      coverImages: restaurant.coverImages.map((coverImage) => coverImage.url),
    },
  });

  async function onSubmit(data: RestaurantInfoFormValues) {
    try {
      const response = await updateSettings(data);

      if (response?.success) {
        toast.success(response.message ?? "Restaurant details saved.");
        form.reset(data);
      } else {
        toast.error(response?.message ?? "Failed to save restaurant details.");
      }
    } catch (error) {
      console.error("Failed to save restaurant details", error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  }

  const control = form.control as Control<any>;
  const logoUrl = form.watch("logoUrl");
  const coverImages = form.watch("coverImages");

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      {/* ── Details ── */}
      <SettingsSection
        title="Restaurant details"
        description="The basics customers see when they find you."
        contentClassName="p-5 space-y-5"
      >
        <FormRenderer
          fields={identityFields}
          control={control}
          className="grid gap-5"
        />
        <FormRenderer
          fields={contactFields}
          control={control}
          className="grid gap-5 sm:grid-cols-2"
        />
        <FormRenderer
          fields={addressFields}
          control={control}
          className="grid gap-5"
        />
      </SettingsSection>

      {/* ── Branding ── */}
      <SettingsSection
        title="Logo & banner images"
        description="Your visual identity on the storefront."
        contentClassName="p-5 grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-8"
      >
        <ImageUploadField
          label="Logo"
          hint="A square mark. Appears beside your name in listings, the dashboard and order confirmations."
          value={logoUrl ? [logoUrl] : []}
          multiple={false}
          onChange={(urls) => form.setValue("logoUrl", urls[0] ?? "")}
        />

        <div className="lg:border-l lg:border-border lg:pl-8">
          <ImageUploadField
            label="Banner images"
            hint="Wide shots of your food or dining room, up to 4. The first one heads your storefront page."
            value={coverImages ?? []}
            aspect="video"
            onChange={(urls) => form.setValue("coverImages", urls)}
          />
        </div>
      </SettingsSection>

      <SettingsSubmitButton
        label="Save restaurant details"
        isSubmitting={form.formState.isSubmitting}
      />
    </form>
  );
};

export default RestaurantInfoForm;
