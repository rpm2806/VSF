import { auth } from "@/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { AddStudentDialog } from "@/components/AddStudentDialog"
import { StudentTableClient } from "@/components/StudentTableClient"

export default async function StudentsPage() {
  const session = await auth()
  
  if (!session || (session.user.role !== "MASTER_ADMIN" && session.user.role !== "VOLUNTEER")) {
    redirect("/dashboard")
  }

  const dbStudents = await db.student.findMany({
    orderBy: { createdAt: "desc" },
    include: { donations: { where: { status: "PAID" } } }
  })

  // Calculate pending dues and advance balance per student
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Students & Alumni</h1>
          <p className="text-muted-foreground mt-1">Manage federation members and records.</p>
        </div>
        <AddStudentDialog />
      </div>

      <StudentTableClient students={students} currentUserRole={session.user.role} />
    </div>
  )
}
