"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Image from "next/image"
import { ExternalLink } from "lucide-react"

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function VerificationQueue({ donations }: { donations: any[] }) {
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<string | null>(null)
  
  const [selectedProof, setSelectedProof] = useState<string | null>(null)

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
      router.refresh()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error.message || "An error occurred")
    } finally {
      setLoadingId(null)
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
              <TableHead>Proof</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {donations.map((donation) => (
              <TableRow key={donation.id}>
                <TableCell>
                  <div className="font-medium">{donation.student.fullName}</div>
                  <div className="text-xs text-muted-foreground font-mono">{donation.student.federationId}</div>
                </TableCell>
                <TableCell className="font-semibold text-emerald-600">₹{donation.amount}</TableCell>
                <TableCell>
                  {donation.paymentProof ? (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setSelectedProof(donation.paymentProof)}
                      className="h-8 gap-1"
                    >
                      View <ExternalLink className="w-3 h-3" />
                    </Button>
                  ) : (
                    <span className="text-xs text-muted-foreground">No screenshot</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button 
                    size="sm" 
                    onClick={() => handleVerify(donation.id)}
                    disabled={loadingId === donation.id}
                    className="h-8 bg-emerald-600 hover:bg-emerald-700"
                  >
                    {loadingId === donation.id ? "Verifying..." : "Approve"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedProof} onOpenChange={() => setSelectedProof(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Payment Screenshot</DialogTitle>
            <DialogDescription>Review the payment proof uploaded by the student.</DialogDescription>
          </DialogHeader>
          <div className="relative w-full aspect-[9/16] bg-muted/30 rounded-lg overflow-hidden border">
            {selectedProof && (
              <Image 
                src={selectedProof} 
                alt="Payment Proof" 
                fill 
                className="object-contain" 
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
