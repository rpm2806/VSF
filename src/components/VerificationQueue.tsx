"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ExternalLink, CheckCircle2, XCircle, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

function getStudentDues(student: any) {
  if (!student || !student.donations) return { text: "—", isNegative: false }
  
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

  if (advanceBalance > 0) {
    return { text: `Advance: ₹${advanceBalance}`, isNegative: true }
  }
  return { text: `Pending Dues: ₹${pendingDues}`, isNegative: false }
}

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function VerificationQueue({ donations, isMasterAdmin = false }: { donations: any[]; isMasterAdmin?: boolean }) {
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [rejectLoadingId, setRejectLoadingId] = useState<string | null>(null)
  const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null)
  
  const [selectedDonation, setSelectedDonation] = useState<{ id: string; proof: string; name: string; amount: number } | null>(null)
  const [rejectDialogId, setRejectDialogId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState("")

  const handleVerify = async (id: string) => {
    setLoadingId(id)
    try {
      const res = await fetch("/api/donations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ donationId: id, action: "VERIFY" })
      })

      if (!res.ok) throw new Error("Failed to verify donation")
      
      toast.success("Donation verified successfully! Receipt generated.")
      setSelectedDonation(null)
      router.refresh()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.message || "An error occurred")
    } finally {
      setLoadingId(null)
    }
  }

  const handleReject = async (id: string) => {
    setRejectLoadingId(id)
    try {
      const res = await fetch("/api/donations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ donationId: id, action: "REJECT", reason: rejectReason })
      })

      if (!res.ok) throw new Error("Failed to reject donation")
      
      toast.success("Payment rejected. Student has been notified.")
      setRejectDialogId(null)
      setRejectReason("")
      setSelectedDonation(null)
      router.refresh()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.message || "An error occurred")
    } finally {
      setRejectLoadingId(null)
    }
  }

  const handleDelete = async (id: string, amount: number) => {
    if (!confirm(`Permanently delete this ₹${amount} pending payment? This cannot be undone.`)) return
    setDeleteLoadingId(id)
    try {
      const res = await fetch("/api/donations", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      })
      if (!res.ok) throw new Error("Failed to delete")
      toast.success("Payment record deleted")
      router.refresh()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.message || "An error occurred")
    } finally {
      setDeleteLoadingId(null)
    }
  }

  if (donations.length === 0) return null

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          Pending Verifications
          <Badge variant="destructive" className="rounded-full">{donations.length}</Badge>
        </h2>
      </div>
      <div className="rounded-md border bg-orange-50/30">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Payment Info / Proof</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {donations.map((donation) => (
              <TableRow key={donation.id}>
                <TableCell>
                  <div className="font-medium">{donation.student.fullName}</div>
                  <div className="text-xs text-muted-foreground font-mono">{donation.student.federationId}</div>
                  {(() => {
                    const dues = getStudentDues(donation.student)
                    return (
                      <div className={cn(
                        "text-xs mt-1 font-semibold",
                        dues.isNegative ? "text-emerald-600" : dues.text.includes("₹0") ? "text-muted-foreground" : "text-amber-600"
                      )}>
                        {dues.text}
                      </div>
                    )
                  })()}
                </TableCell>
                <TableCell className="font-semibold text-emerald-600">₹{donation.amount}</TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1 items-start">
                    <Badge variant="outline" className="text-[10px] uppercase font-semibold">
                      {donation.paymentMethod || "UPI"}
                    </Badge>
                    {donation.paymentMethod === "CASH" ? (
                      donation.notes ? (
                        <span className="text-xs text-muted-foreground">
                          Given to: <span className="font-semibold text-foreground">{donation.notes}</span>
                        </span>
                      ) : (
                        <span className="text-xs text-amber-600 font-medium">Cash (Taker unknown)</span>
                      )
                    ) : donation.paymentProof ? (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setSelectedDonation({ id: donation.id, proof: donation.paymentProof, name: donation.student.fullName, amount: donation.amount })}
                        className="h-7 px-2 text-[11px] gap-1"
                      >
                        View Proof <ExternalLink className="w-3.5 h-3.5" />
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">No proof uploaded</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleVerify(donation.id)}
                      disabled={loadingId === donation.id || rejectLoadingId === donation.id || deleteLoadingId === donation.id}
                      className="h-8 bg-emerald-600 hover:bg-emerald-700 gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {loadingId === donation.id ? "Approving..." : "Approve"}
                    </Button>
                    <Button 
                      size="sm"
                      variant="outline"
                      onClick={() => { setRejectDialogId(donation.id); setRejectReason("") }}
                      disabled={loadingId === donation.id || rejectLoadingId === donation.id || deleteLoadingId === donation.id}
                      className="h-8 border-rose-300 text-rose-600 hover:bg-rose-50 hover:border-rose-400 gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Reject
                    </Button>
                    {isMasterAdmin && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(donation.id, donation.amount)}
                        disabled={loadingId === donation.id || rejectLoadingId === donation.id || deleteLoadingId === donation.id}
                        className="h-8 w-8 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                        title="Delete this payment record"
                      >
                        {deleteLoadingId === donation.id ? "..." : <Trash2 className="w-3.5 h-3.5" />}
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Payment Proof Viewer Dialog */}
      <Dialog open={!!selectedDonation} onOpenChange={() => setSelectedDonation(null)}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Payment Screenshot</DialogTitle>
            <DialogDescription>
              Review the payment proof uploaded by <strong>{selectedDonation?.name}</strong> for ₹{selectedDonation?.amount}.
            </DialogDescription>
          </DialogHeader>
          <div className="w-full bg-muted/30 rounded-lg overflow-auto border flex items-center justify-center" style={{ maxHeight: "60vh" }}>
            {selectedDonation?.proof && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`/api/secure-image?url=${encodeURIComponent(selectedDonation.proof)}`}
                alt="Payment Proof"
                className="w-full h-auto object-contain"
                style={{ maxHeight: "60vh" }}
              />
            )}
          </div>
          <div className="flex gap-2 pt-2">
            <Button
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 gap-2"
              onClick={() => selectedDonation && handleVerify(selectedDonation.id)}
              disabled={loadingId === selectedDonation?.id}
            >
              <CheckCircle2 className="w-4 h-4" />
              {loadingId === selectedDonation?.id ? "Approving..." : "Approve Payment"}
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-rose-300 text-rose-600 hover:bg-rose-50 gap-2"
              onClick={() => { if (selectedDonation) { setRejectDialogId(selectedDonation.id); setRejectReason(""); setSelectedDonation(null) } }}
            >
              <XCircle className="w-4 h-4" />
              Reject Payment
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject Reason Dialog */}
      <Dialog open={!!rejectDialogId} onOpenChange={(open) => { if (!open) { setRejectDialogId(null); setRejectReason("") } }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-rose-600 flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              Reject Payment
            </DialogTitle>
            <DialogDescription>
              Provide a reason for rejection. The student will see this message and can resubmit.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Rejection Reason (Optional)</Label>
              <Textarea
                placeholder="e.g. Wrong amount, blurry screenshot, payment not received..."
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => { setRejectDialogId(null); setRejectReason("") }}>
                Cancel
              </Button>
              <Button
                className="flex-1 bg-rose-600 hover:bg-rose-700 gap-2"
                onClick={() => rejectDialogId && handleReject(rejectDialogId)}
                disabled={rejectLoadingId === rejectDialogId}
              >
                <XCircle className="w-4 h-4" />
                {rejectLoadingId === rejectDialogId ? "Rejecting..." : "Confirm Reject"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
