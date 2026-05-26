import { auth } from "@/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { VolunteerTableClient } from "@/components/VolunteerTableClient"
import { AddVolunteerDialog } from "@/components/AddVolunteerDialog"

export default async function VolunteersPage() {
  const session = await auth()
  
  // Strictly MASTER_ADMIN only
  if (!session || session.user.role !== "MASTER_ADMIN") {
    redirect("/dashboard")
  }

  const volunteers = await db.user.findMany({
    where: { role: "VOLUNTEER" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      status: true,
      createdAt: true
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Volunteers</h1>
          <p className="text-muted-foreground mt-1">Manage volunteer accounts and system access.</p>
        </div>
        <AddVolunteerDialog />
      </div>

      <VolunteerTableClient volunteers={volunteers} />
    </div>
  )
}
