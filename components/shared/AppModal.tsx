import { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  isPending: boolean;
  isEditing: boolean;
  size?: "sm" | "md" | "lg";
  // ── new props for form mode ──
  formId: string;
  onSubmit?: () => void;
}

const modalSizeMap = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-md",
  lg: "sm:max-w-lg",
};

export function AppModal({
  open,
  onClose,
  title,
  description,
  children,
  isPending,
  isEditing,
  size = "md",
  formId,
  onSubmit,
}: ModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className={`
          bg-white border border-[#e5e7eb]
          ${modalSizeMap[size]}
        `}
      >
        <DialogHeader>
          <DialogTitle className="text-base font-semibold text-[#111111]">
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription className="text-sm text-[#6b7280]">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        {/* if formId + onSubmit provided → wrap body in a form */}
        {formId && onSubmit ? (
          <form id={formId} onSubmit={onSubmit}>
            {children}
          </form>
        ) : (
          children
        )}

        <DialogFooter>
          <Button size="lg" variant="outline" className="" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            size="lg"
            variant="default"
            form={formId}
            disabled={isPending}
            className=""
          >
            {isPending ? (
              <>
                <Spinner />
                {isEditing ? "Saving..." : "Creating..."}
              </>
            ) :  (
             isEditing ? "Save Changes" : "Create"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
