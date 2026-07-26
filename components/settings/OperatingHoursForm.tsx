"use client";

import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { OperatingHours } from "@/app/(main)/settings/config";
import { updateHours } from "@/lib/actions/restaurant/settings";
import { toast } from "sonner";
import { Spinner } from "../ui/spinner";

// ── Schema ─────────────────────────────────────────

const daySchema = z.object({
  day: z.number(),
  isOpen: z.boolean(),
  openTime: z.string(),
  closeTime: z.string(),
});

const schema = z.object({
  hours: z.array(daySchema),
});

type FormValues = z.infer<typeof schema>;

// ── Day names ──────────────────────────────────────

const dayNames = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

// ── Component ──────────────────────────────────────

export default function OperatingHoursForm({
  operatingHours,
}: {
  operatingHours: OperatingHours[];
}) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      hours: operatingHours.map((hour) => ({
        day: hour.day,
        isOpen: hour.isOpen,
        openTime: hour.openTime,
        closeTime: hour.closeTime,
      })),
    },
  });

  // this gives us the fields array to loop over
  const { fields } = useFieldArray({
    control: form.control,
    name: "hours",
  });

  async function onSubmit(data: FormValues) {
    try {
      const response = await updateHours(data.hours);

      if (response?.success) {
        toast.success(response.message ?? "Hours updated successfully.");
        // update the form state to match the saved values
        form.reset(data);
      } else {
        toast.error(response?.message ?? "Failed to update hours.");
      }
    } catch (error) {
      // log and show a generic error message for unexpected failures
      // eslint-disable-next-line no-console
      console.error("Failed to update hours", error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid grid-cols-2 gap-5">
        {/* loop over 7 days */}
        {fields.map((field, index) => {
          // watch isOpen for THIS specific day
          const isOpen = form.watch(`hours.${index}.isOpen`);

          return (
            <div
              key={field.id}
              className="flex items-center gap-4 p-3 bg-white border border-[#e5e7eb] rounded-lg"
            >
              {/* Day name — static, from dayNames array */}
              <span className="w-28 text-sm font-medium text-[#111111]">
                {dayNames[field.day]}
              </span>

              {/* isOpen toggle */}
              <Controller
                name={`hours.${index}.isOpen`}
                control={form.control}
                render={({ field: f }) => (
                  <Switch checked={f.value} onCheckedChange={f.onChange} />
                )}
              />

              {/* openTime — disabled when isOpen is false */}
              <Controller
                name={`hours.${index}.openTime`}
                control={form.control}
                render={({ field: f }) => (
                  <Input
                    {...f}
                    type="time"
                    disabled={!isOpen}
                    className="w-32 bg-white border-[#e5e7eb] h-9 disabled:opacity-40"
                  />
                )}
              />

              <span className="text-xs text-[#9ca3af]">to</span>

              {/* closeTime — disabled when isOpen is false */}
              <Controller
                name={`hours.${index}.closeTime`}
                control={form.control}
                render={({ field: f }) => (
                  <Input
                    {...f}
                    type="time"
                    disabled={!isOpen}
                    className="w-32 bg-white border-[#e5e7eb] h-9 disabled:opacity-40"
                  />
                )}
              />
            </div>
          );
        })}
      </div>

      <div className="mt-6">
        <Button
          type="submit"
          className="bg-[#f97316] hover:bg-[#ea6c0a] text-white w-full"
        >
          {
            form.formState.isSubmitting && <Spinner/>
          }
          {
            form.formState.isSubmitting ? "Saving..." : "Save Hours"
          }
        </Button>
      </div>
    </form>
  );
}
