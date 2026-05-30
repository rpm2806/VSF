import { db } from "@/lib/db"
import LandingPage from "@/components/LandingPage"

export const dynamic = "force-dynamic"

export default async function Page() {
  const [studentCount, alumniCount] = await Promise.all([
    db.student.count({ where: { status: "ACTIVE", deletedAt: null } }),
    db.student.count({ where: { status: "ALUMNI", deletedAt: null } }),
  ])

  return <LandingPage studentCount={studentCount} alumniCount={alumniCount} />
}
