import { auth } from "@/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { StudentProfileSettingsForm } from "@/components/StudentProfileSettingsForm"
import { AdminSettingsForm } from "@/components/AdminSettingsForm"

export default async function SettingsPage() {
  const session = await auth()
  
  if (!session?.user) redirect("/login")
  
  const role = session.user.role as string

  if (role === "STUDENT" || role === "ALUMNI" || role === "OTHER") {
    const student = await db.student.findUnique({
      where: { id: session.user.id }
    })

    if (!student) return <div>Student not found</div>

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your personal profile and contact information.</p>
        </div>
        <StudentProfileSettingsForm student={student} />
      </div>
    )
  }

  // Admin view
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
        <p className="text-muted-foreground mt-1">Manage organization preferences and defaults.</p>
      </div>

      {role === "MASTER_ADMIN" && (
        <AdminSettingsForm />
      )}
    </div>
  )
}
