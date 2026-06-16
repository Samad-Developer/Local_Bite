import { ReactNode } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "../ui/button";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  isPending: boolean;
  isEditing: boolean;
  onSubmit: () => void;
  side?: "left" | "right";
  size?: "sm" | "md" | "lg";
  formId: string;
}


export default function AppDrawer({
  open,
  onClose,
  title,
  description,
  children,
  isPending,
  isEditing,
  onSubmit,
  side = "right",
  size = "lg",
  formId,
}: DrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side={side}>
        {/* Header */}
        <SheetHeader className="px-6 py-4 border-b border-[#f3f4f6]">
          <SheetTitle className="text-lg font-semibold text-[#111111]">
            {title}
          </SheetTitle>
          {description && (
            <SheetDescription className="text-sm text-[#6b7280]">
              {description}
            </SheetDescription>
          )}
        </SheetHeader>

        {/* if formId + onSubmit provided → wrap body in a form */}
        {formId && onSubmit ? (
          <form id={formId} onSubmit={onSubmit}>
            <div className="px-4">
            {children}
            </div>
          </form>
        ) : (
          children
        )}

        <SheetFooter>
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
            {isPending
              ? isEditing
                ? "Saving..."
                : "Creating..."
              : isEditing
                ? "Save Changes"
                : "Create"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
