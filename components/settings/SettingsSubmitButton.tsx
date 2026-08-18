"use client";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export function SettingsSubmitButton({
  label,
  pendingLabel = "Saving…",
  isSubmitting,
}: {
  label: string;
  pendingLabel?: string;
  isSubmitting: boolean;
}) {
  return (
    <Button
      type="submit"
      size="lg"
      variant="default"
      disabled={isSubmitting}
      aria-busy={isSubmitting}
      className="w-full mt-5"
    >
      {isSubmitting && <Spinner />}
      {isSubmitting ? pendingLabel : label}
    </Button>
  );
}
