import { auth } from "@/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { QueriesClient } from "@/components/QueriesClient"

export default async function QueriesPage() {
  const session = await auth()

  if (!session || (session.user as { role?: string }).role !== "MASTER_ADMIN") {
    redirect("/dashboard")
  }

  const requests = await db.supportRequest.findMany({
    orderBy: { createdAt: "desc" }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Queries & Complaints</h1>
        <p className="text-muted-foreground mt-1">
          All student support requests submitted via the public portal.
        </p>
      </div>
      <QueriesClient requests={requests} />
    </div>
  )
}
