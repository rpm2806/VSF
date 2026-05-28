import { auth } from "@/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { StudentTableClient } from "@/components/StudentTableClient"
import { AddStudentDialog } from "@/components/AddStudentDialog"

export default async function BatchesPage() {
  const session = await auth()
  
  if (!session || (session.user.role !== "MASTER_ADMIN" && session.user.role !== "VOLUNTEER")) {
    redirect("/dashboard")
  }

  const dbStudents = await db.student.findMany({
    orderBy: { createdAt: "desc" },
    include: { donations: { where: { status: "PAID" } } }
  })

  // Calculate pending dues and advance balance
  const students = dbStudents.map(student => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const totalDonations = student.donations.reduce((acc: number, d: any) => acc + d.amount, 0)

    let pendingDues = 0
    let advanceBalance = 0

    if (student.donationStartDate) {
      const start = new Date(student.donationStartDate)
      const now = new Date()
      const startUTC = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate())
      const nowUTC = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
      const diffDays = Math.floor((nowUTC - startUTC) / (1000 * 60 * 60 * 24))
      const totalDays = diffDays >= 0 ? diffDays + 1 : 0
      const totalOwed = totalDays * 1 // ₹1/day rate

      pendingDues    = Math.max(0, totalOwed - totalDonations)
      advanceBalance = Math.max(0, totalDonations - totalOwed)
    } else {
      pendingDues = student.duesAmount || 0
    }
    return { ...student, pendingDues, advanceBalance }
  })



  const existingBatches = Array.from(new Set(dbStudents.map(s => s.batch).filter(Boolean))).sort() as string[]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Batches</h1>
          <p className="text-muted-foreground mt-1">Manage and view students organized by their academic batch.</p>
        </div>
        <AddStudentDialog existingBatches={existingBatches} />
      </div>

      <StudentTableClient students={students} />
    </div>
  )
}
