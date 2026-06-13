import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"

interface HeaderProps {
  user: {
    name?: string | null
    email?: string | null
    role: string
  }
}

export default function Header({ user }: HeaderProps) {

  return (
    <header className="sticky top-0 z-50 h-16 bg-white border-b border-[#e5e7eb] flex items-center justify-between px-4">

      {/* Left — Toggle + Title */}
      <div className="flex items-center gap-3">
        <SidebarTrigger
          className="
            bg-transparent w-9 h-9 flex items-center justify-center rounded-lg
            text-[#6b7280] hover:text-[#111111]
            hover:bg-[#f9f9f9] border border-transparent
            hover:border-[#e5e7eb] transition-all duration-150
          "
        />
        <Separator orientation="vertical" className="bg-[#e5e7eb]" />
      </div>

      {/* Right — User Info */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full border bg-slate-100 flex items-center justify-center shadow-sm">
          <span className="text-black text-sm font-semibold">
            {user.name?.charAt(0).toUpperCase()}
          </span>
        </div>
      </div>
    </header>
  )
}