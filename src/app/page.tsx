import { db } from "@/lib/db"
import LandingPage from "@/components/LandingPage"

export default async function Page() {
  const [studentCount, alumniCount] = await Promise.all([
    db.student.count({ where: { status: "ACTIVE" } }),
    db.student.count({ where: { status: "ALUMNI" } }),
  ])

  return <LandingPage studentCount={studentCount} alumniCount={alumniCount} />
}
