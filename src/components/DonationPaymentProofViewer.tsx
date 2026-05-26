"use client"

import { useState } from "react"
import Image from "next/image"
import { ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function DonationPaymentProofViewer({ proofUrl }: { proofUrl: string }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="h-7 text-xs gap-1 border-blue-200 text-blue-600 hover:bg-blue-50"
      >
        View Proof <ExternalLink className="w-3 h-3" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Payment Screenshot</DialogTitle>
            <DialogDescription>
              Your uploaded payment proof. It is being reviewed by the admin.
            </DialogDescription>
          </DialogHeader>
          <div className="relative w-full bg-muted/30 rounded-lg overflow-hidden border" style={{ maxHeight: "65vh" }}>
            <Image
              src={proofUrl}
              alt="Payment Proof"
              width={500}
              height={700}
              className="w-full h-auto object-contain"
              style={{ maxHeight: "65vh" }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
