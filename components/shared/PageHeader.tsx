import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface PageHeaderProps {
  title: string
  buttonLabel: string
  onButtonClick: () => void
}

export default function PageHeader({
  title,
  buttonLabel,
  onButtonClick,
}: PageHeaderProps) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h1 className="text-2xl font-semibold text-[#111111]">{title}</h1>
      <Button
        size="lg"
        onClick={onButtonClick}
        className="bg-[#f97316] hover:bg-[#ea6c0a] text-white"
      >
        <Plus className="w-5 h-5 mr-2" />
        {buttonLabel}
      </Button>
    </div>
  )
}