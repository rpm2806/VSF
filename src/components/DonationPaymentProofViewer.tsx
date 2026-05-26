"use client"

import { useState } from "react"
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
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Payment Screenshot</DialogTitle>
            <DialogDescription>
              Your uploaded payment proof. It is being reviewed by the admin.
            </DialogDescription>
          </DialogHeader>
          <div className="w-full rounded-lg overflow-auto border bg-muted/30 flex items-center justify-center" style={{ maxHeight: "65vh" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={proofUrl}
              alt="Payment Proof"
              className="w-full h-auto object-contain"
              style={{ maxHeight: "65vh" }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
