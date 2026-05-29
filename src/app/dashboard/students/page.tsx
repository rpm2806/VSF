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
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: { donations: { where: { status: "PAID", deletedAt: null } } }
  })

  // Calculate pending dues and advance balance per student
  const students = dbStudents.map(student => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const totalDonations = student.donations.reduce((acc: number, d: any) => acc + d.amount, 0)

    let pendingDues = 0
    let advanceBalance = 0

    const effectiveStartDate = student.donationStartDate || student.createdAt
    if (effectiveStartDate) {
      const startIST = new Date(new Date(effectiveStartDate).toLocaleString("en-US", { timeZone: "Asia/Kolkata" }))
      const nowIST = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }))
      const startUTC = Date.UTC(startIST.getFullYear(), startIST.getMonth(), startIST.getDate())
      const nowUTC = Date.UTC(nowIST.getFullYear(), nowIST.getMonth(), nowIST.getDate())
      const diffDays = Math.floor((nowUTC - startUTC) / (1000 * 60 * 60 * 24))

      if (diffDays >= 0) {
        const totalDays = diffDays + 1
        const totalOwed = (totalDays * 1) + (student.duesAmount || 0)
        pendingDues    = Math.max(0, totalOwed - totalDonations)
        advanceBalance = Math.max(0, totalDonations - totalOwed)
      } else {
        const advanceDays = Math.abs(diffDays)
        pendingDues    = Math.max(0, (student.duesAmount || 0) - totalDonations)
        advanceBalance = Math.max(0, totalDonations - (student.duesAmount || 0)) + (advanceDays * 1)
      }
    } else {
      pendingDues = Math.max(0, (student.duesAmount || 0) - totalDonations)
    }
    return { ...student, pendingDues, advanceBalance }
  })

  const existingBatches = Array.from(new Set(dbStudents.map(s => s.batch).filter(Boolean))).sort() as string[]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Students & Alumni</h1>
          <p className="text-muted-foreground mt-1">Manage federation members and records.</p>
        </div>
        <AddStudentDialog existingBatches={existingBatches} />
      </div>

      <StudentTableClient students={students} currentUserRole={session.user.role} />
    </div>
  )
}
