import { auth } from "@/auth"
import { db } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, IndianRupee, Users, ArrowUpRight, ArrowDownRight, HeartHandshake } from "lucide-react"
import { OverviewChart } from "@/components/OverviewChart"

export default async function DashboardPage() {
  const session = await auth()
  
  if (!session?.user) return null
  const role = session.user.role as string

  // Fetch metrics based on role
  let totalStudents = 0
  let totalDonations = 0
  let totalExpenses = 0
  let adminTotalPendingDues = 0
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let monthlyData: any[] = []

  if (role === "MASTER_ADMIN" || role === "VOLUNTEER") {
    totalStudents = await db.student.count({ where: { status: "ACTIVE", deletedAt: null } })
    const sum = await db.donation.aggregate({
      _sum: { amount: true },
      where: { status: "PAID", deletedAt: null }
    })
    totalDonations = sum._sum.amount || 0

    const expSum = await db.expense.aggregate({
      _sum: { amount: true },
      where: { status: "APPROVED", deletedAt: null }
    })
    totalExpenses = expSum._sum.amount || 0

    // Calculate total pending dues for the admin
    const activeStudents = await db.student.findMany({
      where: { status: "ACTIVE", deletedAt: null },
      include: { donations: { where: { status: "PAID", deletedAt: null } } }
    })

    activeStudents.forEach(student => {
      if (student.donationStartDate) {
        const start = new Date(student.donationStartDate)
        const now = new Date()
        const startUTC = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate())
        const nowUTC = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
        const diffDays = Math.floor((nowUTC - startUTC) / (1000 * 60 * 60 * 24))
        const totalDays = diffDays >= 0 ? diffDays + 1 : 0
        const totalOwed = totalDays * 1
        const totalDonated = student.donations.reduce((acc, d) => acc + d.amount, 0)
        adminTotalPendingDues += Math.max(0, totalOwed - totalDonated)
      } else {
        adminTotalPendingDues += student.duesAmount || 0
      }
    })

    // Prepare chart data for current year
    const currentYear = new Date().getFullYear()
    const yearlyDonations = await db.donation.findMany({
      where: { status: "PAID", deletedAt: null, createdAt: { gte: new Date(`${currentYear}-01-01`) } }
    })
    const yearlyExpenses = await db.expense.findMany({
      where: { status: "APPROVED", deletedAt: null, date: { gte: new Date(`${currentYear}-01-01`) } }
    })

    monthlyData = Array.from({ length: 12 }, (_, i) => ({
      name: new Date(0, i).toLocaleString('default', { month: 'short' }),
      collections: 0,
      expenses: 0
    }))

    yearlyDonations.forEach(d => {
      const month = d.createdAt.getMonth()
      monthlyData[month].collections += d.amount
    })
    yearlyExpenses.forEach(e => {
      const month = e.createdAt.getMonth()
      monthlyData[month].expenses += e.amount
    })
  }

  let studentData = null
  let totalStudentDonations = 0
  let studentPendingDues = 0

  if (role === "STUDENT" || role === "ALUMNI") {
    studentData = await db.student.findUnique({ where: { id: session.user.id } })
    const sum = await db.donation.aggregate({
      _sum: { amount: true },
      where: { studentId: session.user.id, status: "PAID", deletedAt: null }
    })
    totalStudentDonations = sum._sum.amount || 0

    if (studentData?.donationStartDate) {
      const start = new Date(studentData.donationStartDate)
      const now = new Date()
      
      // Calculate days difference (midnight to midnight)
      const startUTC = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate())
      const nowUTC = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
      const diffDays = Math.floor((nowUTC - startUTC) / (1000 * 60 * 60 * 24))
      
      // Add 1 to make it inclusive of the start day
      const totalDays = diffDays >= 0 ? diffDays + 1 : 0
      
      // 1 Rupee per day
      const totalOwed = totalDays * 1
      
      studentPendingDues = Math.max(0, totalOwed - totalStudentDonations)
    } else {
      studentPendingDues = studentData?.duesAmount || 0
    }
  }

  const recentActivities = await db.auditLog.findMany({
    take: 10,
    orderBy: { createdAt: "desc" }
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back, {session.user.name}. Here&apos;s what&apos;s happening.</p>
      </div>

      {(role === "MASTER_ADMIN" || role === "VOLUNTEER") && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="shadow-sm border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStudents}</div>
              <p className="text-xs text-muted-foreground mt-1">Active federation members</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Collections</CardTitle>
              <ArrowUpRight className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">₹{totalDonations.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">Verified payments</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <ArrowDownRight className="h-4 w-4 text-rose-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-rose-600">₹{totalExpenses.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">Approved expenses</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-border/50 border-orange-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-700">Total Pending Dues</CardTitle>
              <AlertCircle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">₹{adminTotalPendingDues.toLocaleString()}</div>
              <p className="text-xs text-orange-600/80 mt-1">From all active students</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Admin Charts Section */}
      {(role === "MASTER_ADMIN" || role === "VOLUNTEER") && (
        <Card className="shadow-sm border-border/50 mb-8">
          <CardHeader>
            <CardTitle>Financial Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <OverviewChart data={monthlyData} />
          </CardContent>
        </Card>
      )}

      {(role === "STUDENT" || role === "ALUMNI") && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="shadow-sm border-border/50 bg-gradient-to-br from-primary/10 to-transparent">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Federation ID</CardTitle>
              <HeartHandshake className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold font-mono tracking-wider">{session.user.federationId}</div>
              <p className="text-xs text-muted-foreground mt-1">Status: {studentData?.status || "ACTIVE"}</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Contributed</CardTitle>
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">₹{totalStudentDonations.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">Lifetime contributions</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-border/50 border-orange-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-700">Pending Dues</CardTitle>
              <AlertCircle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">₹{studentPendingDues.toLocaleString()}</div>
              <p className="text-xs text-orange-600/80 mt-1">Calculated at ₹1/day from start date</p>
            </CardContent>
          </Card>
        </div>
      )}

      {(role === "MASTER_ADMIN" || role === "VOLUNTEER") && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4 shadow-sm border-border/50">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {recentActivities.length === 0 ? (
                <p className="text-sm text-muted-foreground">No recent activity to show.</p>
              ) : (
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex flex-col space-y-1 pb-4 border-b last:border-0 last:pb-0">
                      <p className="text-sm text-foreground">
                        {activity.details || activity.action}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
