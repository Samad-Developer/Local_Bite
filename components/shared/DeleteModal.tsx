import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { Spinner } from "../ui/spinner";

interface DeleteModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  isPending?: boolean;
}

export function DeleteModal({
  open,
  onClose,
  onConfirm,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  isPending = false,
}: DeleteModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-[#fef2f2] flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-[#dc2626]" />
          </div>
          <p className="text-sm text-[#6b7280] pt-2">{description}</p>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 border-[#e5e7eb] text-[#6b7280] hover:bg-[#f9f9f9]"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isPending}
            className="flex-1 bg-[#dc2626] hover:bg-[#b91c1c] text-white"
          >
            {isPending ? (
              <>
                <Spinner />
                Deleting...
              </>
            ) : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
