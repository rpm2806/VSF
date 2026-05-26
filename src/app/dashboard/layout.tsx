import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Sidebar from "@/components/Sidebar"
import Topbar from "@/components/Topbar"
import { db } from "@/lib/db"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const userRole = (session.user as { role?: string }).role

  const pendingQueries = userRole === "MASTER_ADMIN"
    ? await db.supportRequest.count({ where: { status: "PENDING" } })
    : 0

  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      <Sidebar userRole={userRole as string} pendingQueries={pendingQueries} />
      <div className="flex flex-col flex-1 sm:pl-64">
        <Topbar user={session.user} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
