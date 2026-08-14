"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { OperatingHours } from "@/app/(main)/settings/config";
import { updateHours } from "@/lib/actions/restaurant/settings";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { SettingsSection } from "./SettingsSection";
import { SettingsSubmitButton } from "./SettingsSubmitButton";

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
// OperatingHours stores Monday as day 0.

const dayNames = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

// A native time input renders "09:00 AM" plus its own picker icon, so it
// needs real room. shrink-0 matters just as much as the width: Input's base
// class sets min-w-0, which lets the flex row squeeze the control until the
// meridiem is clipped off.
const TIME_INPUT_CLASS = "w-40 shrink-0 tabular-nums";

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

  // One subscription for the whole array rather than one per row — the
  // rows only need to know whether their own day is open.
  const hours = form.watch("hours");
  const openCount = hours?.filter((h) => h?.isOpen).length ?? 0;

  // Resolved after mount: computing "today" during render would risk a
  // hydration mismatch across a midnight boundary.
  const [todayIndex, setTodayIndex] = useState<number | null>(null);
  useEffect(() => {
    setTodayIndex((new Date().getDay() + 6) % 7);
  }, []);

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
      console.error("Failed to update hours", error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      <SettingsSection
        title="Operating hours"
        description="When customers can place orders. Closed days are skipped at checkout."
        contentClassName="divide-y divide-border"
        action={
          <span className="text-xs text-label tabular-nums">
            Open{" "}
            <span className="font-semibold text-title">{openCount}</span> of 7
            days
          </span>
        }
      >
        {fields.map((field, index) => {
          const isOpen = hours?.[index]?.isOpen ?? false;
          const isToday = todayIndex === field.day;

          return (
            <div
              key={field.id}
              className={cn(
                "flex flex-wrap items-center gap-x-4 gap-y-3 px-5 py-3.5 transition-colors duration-150",
                isToday && "bg-brand-subtle/60",
              )}
            >
              {/* Day name — static, from dayNames array */}
              <div className="flex items-center gap-2 w-36 shrink-0">
                <span
                  className={cn(
                    "text-sm",
                    isOpen ? "font-medium text-title" : "text-label",
                  )}
                >
                  {dayNames[field.day]}
                </span>
                {isToday && (
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-brand">
                    Today
                  </span>
                )}
              </div>

              {/* isOpen toggle */}
              <Controller
                name={`hours.${index}.isOpen`}
                control={form.control}
                render={({ field: f }) => (
                  <Switch checked={f.value} onCheckedChange={f.onChange} />
                )}
              />

              <span
                className={cn(
                  "text-xs font-medium w-14 shrink-0",
                  isOpen ? "text-[#16a34a]" : "text-soft",
                )}
              >
                {isOpen ? "Open" : "Closed"}
              </span>

              {/* Times stay mounted when closed so the values survive a
                  toggle — they are only disabled and dimmed. */}
              <div
                className={cn(
                  "flex items-center gap-2 ml-auto transition-opacity duration-150",
                  !isOpen && "opacity-55",
                )}
              >
                <Controller
                  name={`hours.${index}.openTime`}
                  control={form.control}
                  render={({ field: f }) => (
                    <Input
                      {...f}
                      type="time"
                      aria-label={`${dayNames[field.day]} opening time`}
                      disabled={!isOpen}
                      className={TIME_INPUT_CLASS}
                    />
                  )}
                />

                <span className="text-xs text-soft">to</span>

                <Controller
                  name={`hours.${index}.closeTime`}
                  control={form.control}
                  render={({ field: f }) => (
                    <Input
                      {...f}
                      type="time"
                      aria-label={`${dayNames[field.day]} closing time`}
                      disabled={!isOpen}
                      className={TIME_INPUT_CLASS}
                    />
                  )}
                />
              </div>
            </div>
          );
        })}
      </SettingsSection>

      <SettingsSubmitButton
        label="Save operating hours"
        isSubmitting={form.formState.isSubmitting}
      />
    </form>
  );
}
