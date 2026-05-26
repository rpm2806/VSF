import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { AddDonationDialog } from "@/components/AddDonationDialog"
import StudentDonationDialog from "@/components/StudentDonationDialog"
import VerificationQueue from "@/components/VerificationQueue"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default async function DonationsPage() {
  const session = await auth()
  
  if (!session?.user) redirect("/login")
  
  const role = session.user.role as string

  // Query conditions based on role
  const whereCondition = role === "STUDENT" ? { studentId: session.user.id } : {}

  const donations = await db.donation.findMany({
    where: whereCondition,
    include: {
      student: { select: { fullName: true, federationId: true } },
      receipt: { select: { id: true } }
    },
    orderBy: { createdAt: "desc" }
  })

  // We need to fetch students for the AddDonationDialog if the user is Admin/Volunteer
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let students: any[] = []
  if (role === "MASTER_ADMIN" || role === "VOLUNTEER") {
    students = await db.student.findMany({
      select: { id: true, fullName: true, federationId: true },
      where: { status: "ACTIVE" }
    })
  }

  const pendingDonations = donations.filter(d => d.status === "PENDING")
  const historyDonations = role === "STUDENT" ? donations : donations.filter(d => d.status !== "PENDING" || role === "STUDENT")

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contributions</h1>
          <p className="text-muted-foreground mt-1">Manage and track federation donations.</p>
        </div>
        {(role === "MASTER_ADMIN" || role === "VOLUNTEER") && (
          <AddDonationDialog students={students} />
        )}
        {role === "STUDENT" && (
          <StudentDonationDialog />
        )}
      </div>

      {(role === "MASTER_ADMIN" || role === "VOLUNTEER") && (
        <VerificationQueue donations={pendingDonations} />
      )}

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {historyDonations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  No donation history found.
                </TableCell>
              </TableRow>
            ) : (
              historyDonations.map((donation) => (
                <TableRow key={donation.id}>
                  <TableCell>
                    <div className="font-medium">{donation.student.fullName}</div>
                    <div className="text-xs text-muted-foreground font-mono">{donation.student.federationId}</div>
                  </TableCell>
                  <TableCell>
                    {donation.startMonth}/{donation.startYear} 
                    {donation.endMonth && (donation.startMonth !== donation.endMonth || donation.startYear !== donation.endYear) 
                      ? ` - ${donation.endMonth}/${donation.endYear}` 
                      : ''}
                  </TableCell>
                  <TableCell className="font-semibold text-emerald-600">₹{donation.amount}</TableCell>
                  <TableCell>{donation.paymentMethod}</TableCell>
                  <TableCell>{new Date(donation.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={donation.status === "PAID" ? "default" : donation.status === "PENDING" ? "secondary" : "destructive"} 
                      className={donation.status === "PAID" ? "bg-emerald-500 hover:bg-emerald-600" : donation.status === "PENDING" ? "bg-orange-400 hover:bg-orange-500 text-white" : ""}>
                      {donation.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {/* Placeholder for verify/receipt button */}
                    {donation.status === "PAID" ? (
                      donation.receipt ? (
                        <a href={`/api/receipts/${donation.receipt.id}`} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-blue-600 hover:underline">
                          View Receipt
                        </a>
                      ) : (
                        <span className="text-xs font-medium text-emerald-600">Receipt Gen.</span>
                      )
                    ) : (role === "MASTER_ADMIN" || role === "VOLUNTEER") ? (
                      <span className="text-xs font-medium text-blue-600 cursor-pointer hover:underline">Verify</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
