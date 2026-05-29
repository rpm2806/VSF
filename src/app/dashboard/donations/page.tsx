import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { AddDonationDialog } from "@/components/AddDonationDialog"
import StudentDonationDialog from "@/components/StudentDonationDialog"
import VerificationQueue from "@/components/VerificationQueue"
import DonationPaymentProofViewer from "@/components/DonationPaymentProofViewer"
import DeleteDonationButton from "@/components/DeleteDonationButton"
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
  const whereCondition = (role === "STUDENT" || role === "ALUMNI" || role === "OTHER") ? { studentId: session.user.id } : {}

  const donations = await db.donation.findMany({
    where: { ...whereCondition, deletedAt: null },
    include: {
      student: {
        include: {
          donations: { where: { status: "PAID", deletedAt: null } }
        }
      },
      receipt: { select: { id: true } },
      verifiedBy: { select: { name: true } }
    },
    orderBy: { createdAt: "desc" }
  })

  // We need to fetch students for the AddDonationDialog if the user is Admin/Volunteer
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let students: any[] = []
  if (role === "MASTER_ADMIN" || role === "VOLUNTEER") {
    students = await db.student.findMany({
      select: { id: true, fullName: true, federationId: true },
      where: { status: "ACTIVE", deletedAt: null }
    })
  }

  const pendingDonations = donations.filter(d => d.status === "PENDING")
  // Students/Alumni see all their own donations (including pending & rejected)
  // Admins/Volunteers see history (non-pending) donations
  const historyDonations = (role === "STUDENT" || role === "ALUMNI" || role === "OTHER") 
    ? donations 
    : donations.filter(d => d.status !== "PENDING")

  const isAdminOrVolunteer = role === "MASTER_ADMIN" || role === "VOLUNTEER"
  const isMasterAdmin = role === "MASTER_ADMIN"

  function getStatusBadge(status: string) {
    if (status === "PAID") return { variant: "default" as const, className: "bg-emerald-500 hover:bg-emerald-600" }
    if (status === "PENDING") return { variant: "secondary" as const, className: "bg-orange-400 hover:bg-orange-500 text-white" }
    if (status === "REJECTED") return { variant: "destructive" as const, className: "bg-rose-500 hover:bg-rose-600" }
    return { variant: "secondary" as const, className: "" }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contributions</h1>
          <p className="text-muted-foreground mt-1">Manage and track federation donations.</p>
        </div>
        {isAdminOrVolunteer && (
          <AddDonationDialog students={students} />
        )}
        {(role === "STUDENT" || role === "ALUMNI" || role === "OTHER") && (
          <StudentDonationDialog />
        )}
      </div>

      {isAdminOrVolunteer && (
        <VerificationQueue donations={pendingDonations} isMasterAdmin={isMasterAdmin} />
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
              <TableHead>Verified By</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {historyDonations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                  No donation history found.
                </TableCell>
              </TableRow>
            ) : (
              historyDonations.map((donation) => {
                const { variant, className } = getStatusBadge(donation.status)
                return (
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
                    <TableCell>
                      <div className="font-medium text-sm">{donation.paymentMethod}</div>
                      {donation.notes && (
                        <div className="text-xs text-muted-foreground mt-0.5 italic">
                          {donation.paymentMethod === "CASH" ? "Given to: " : "Notes: "}
                          <span className="font-semibold text-foreground not-italic">{donation.notes}</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{new Date(donation.createdAt).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", day: "2-digit", month: "short", year: "numeric" })}</TableCell>
                    <TableCell>
                      <Badge variant={variant} className={className}>
                        {donation.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {donation.verifiedBy ? (
                        <div className="text-xs">
                          <span className="font-medium text-emerald-700">{donation.verifiedBy.name}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 flex-wrap">
                        {isAdminOrVolunteer ? (
                          <>
                            {donation.receipt && (
                              <a
                                href={`/api/receipts/${donation.receipt.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-medium text-blue-600 hover:underline"
                              >
                                View Receipt
                              </a>
                            )}
                            {donation.paymentProof && (
                              <DonationPaymentProofViewer proofUrl={donation.paymentProof} />
                            )}
                            {!donation.receipt && !donation.paymentProof && (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </>
                        ) : (
                          <>
                            {donation.status === "PAID" ? (
                              donation.receipt ? (
                                <a
                                  href={`/api/receipts/${donation.receipt.id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs font-medium text-blue-600 hover:underline"
                                >
                                  View Receipt
                                </a>
                              ) : (
                                <span className="text-xs font-medium text-emerald-600">Receipt Gen.</span>
                              )
                            ) : donation.status === "REJECTED" ? (
                              <span className="text-xs font-medium text-rose-600">Rejected</span>
                            ) : donation.status === "PENDING" && donation.paymentProof ? (
                              <DonationPaymentProofViewer proofUrl={donation.paymentProof} />
                            ) : (
                              <span className="text-xs text-muted-foreground">Awaiting</span>
                            )}
                          </>
                        )}
                        {/* Master Admin delete button — always visible */}
                        {isMasterAdmin && (
                          <DeleteDonationButton id={donation.id} amount={donation.amount} />
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
