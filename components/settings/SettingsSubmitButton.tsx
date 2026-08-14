"use client";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

/**
 * Submit control shared by every settings form.
 *
 * Disabling it while the action is in flight is what stops a second save
 * being fired. That also covers the keyboard path: the HTML spec skips
 * implicit (Enter key) submission when the form's default button is
 * disabled, so there is no need for a separate guard in the handler.
 */
export function SettingsSubmitButton({
  label,
  pendingLabel = "Saving…",
  isSubmitting,
}: {
  /** What this form saves, e.g. "Save operating hours". */
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
