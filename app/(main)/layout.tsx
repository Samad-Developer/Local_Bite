import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import AppSidebar from "@/components/dashboard/sidebar"
import Header from "@/components/dashboard/header"

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session) redirect("/login")

  return (
    <SidebarProvider>
      <AppSidebar
        role={session.user.role}
        name={session.user.name ?? "User"}
        email={session.user.email ?? ""}
      />
      <SidebarInset>
        <Header user={session.user} />

        <main className="flex-1 overflow-y-auto p-6 bg-surface">
          {children}
        </main>

      </SidebarInset>
    </SidebarProvider>
  )
}