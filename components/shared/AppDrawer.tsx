import { ReactNode } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet"
import { Button } from "../ui/button"

interface DrawerProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  side?: "left" | "right"
  size?: "sm" | "md" | "lg"
}

const sizeMap = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-lg",
  lg: "sm:max-w-4xl",
}

export default function AppDrawer({
  open,
  onClose,
  title,
  description,
  children,
  side = "right",
  size = "lg",
}: DrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side={side}
        className={`
          bg-white border-l border-[#e5e7eb]
          flex flex-col p-0
          ${sizeMap[size]}
        `}
      >
        {/* Header */}
        <SheetHeader className="px-6 py-4 border-b border-[#f3f4f6] flex-shrink-0">
          <SheetTitle className="text-lg font-semibold text-[#111111]">
            {title}
          </SheetTitle>
          {description && (
            <SheetDescription className="text-sm text-[#6b7280]">
              {description}
            </SheetDescription>
          )}
        </SheetHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {children}
        </div>

          <SheetFooter>
            <Button>Submit</Button>
            <Button>Cancel</Button>
          </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}